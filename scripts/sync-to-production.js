const fs = require('fs');
const https = require('https');

const PROD_URL = 'resistproject-production.up.railway.app';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjEsImdycCI6MSwiaWF0IjoxNzY5MzUxNTIxLCJleHAiOjE4MDA5MDkxMjEsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.BIL_mIqkaO2Pzk49o7kXRdlP9luDJf-CdwZB9Uwd0vYNDBSZ03QvHcrRtkb3Uls1xcihpGaLAsy_RBocYgk5_DBv0Aw_JRQ-besv9jNOEOv5bcc0FxFWW7C42d7J_AiuH1n44nWfkoeX4X8DriV4POB43GzTvGKvM7n5RhrwdN0Y02VgrxActuUtbFEoO3QiWAyRbPhncCNdzA9SIhAeN5A_QZNUmmEezYxStIDG5r_tomf30UO02eR1N_PvQLy30X_LiJyiM_GqMbpTiGxPsMGzIGoTIjuOpqa_inJZw0ZzITb4oEDzlJWFCGnlcZ8AggNgJlngmGrIUtk8VFZKeA';

const CONTENT_DIR = '/home/lknipko/civic-action-wiki/content';

function graphqlRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });

    const options = {
      hostname: PROD_URL,
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Parse error'));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getPageByPath(path) {
  const query = `
    query GetPage($path: String!) {
      pages {
        singleByPath(path: $path, locale: "en") {
          id
          path
          title
        }
      }
    }
  `;
  const result = await graphqlRequest(query, { path });
  return result.data?.pages?.singleByPath;
}

async function updatePage(id, content) {
  const mutation = `
    mutation UpdatePage($id: Int!, $content: String!, $tags: [String]!) {
      pages {
        update(id: $id, content: $content, tags: $tags) {
          responseResult { succeeded message }
        }
      }
    }
  `;
  return graphqlRequest(mutation, { id, content, tags: [] });
}

async function createPage(path, title, description, content) {
  const mutation = `
    mutation CreatePage($content: String!, $description: String!, $path: String!, $title: String!) {
      pages {
        create(
          content: $content
          description: $description
          editor: "markdown"
          isPublished: true
          isPrivate: false
          locale: "en"
          path: $path
          tags: []
          title: $title
        ) {
          responseResult { succeeded message }
          page { id path }
        }
      }
    }
  `;
  return graphqlRequest(mutation, { content, description, path, title });
}

// Recursively find all .md files
function findMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = `${dir}/${item}`;
    if (fs.statSync(fullPath).isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  console.log('Syncing content to production...\n');

  const mdFiles = findMarkdownFiles(CONTENT_DIR);

  for (const file of mdFiles) {
    // Convert file path to wiki path
    const relativePath = file.replace(CONTENT_DIR + '/', '').replace('.md', '');
    const content = fs.readFileSync(file, 'utf8');

    // Extract title from first # heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : relativePath;

    // Check if page exists
    const existingPage = await getPageByPath(relativePath);

    if (existingPage) {
      // Update existing page
      const result = await updatePage(existingPage.id, content);
      if (result.data?.pages?.update?.responseResult?.succeeded) {
        console.log(`✓ Updated: ${relativePath}`);
      } else {
        console.log(`✗ Failed to update ${relativePath}: ${result.data?.pages?.update?.responseResult?.message || 'Unknown'}`);
      }
    } else {
      // Create new page
      const result = await createPage(relativePath, title, `${title} - Resist Project`, content);
      if (result.data?.pages?.create?.responseResult?.succeeded) {
        console.log(`✓ Created: ${relativePath}`);
      } else {
        console.log(`✗ Failed to create ${relativePath}: ${result.data?.pages?.create?.responseResult?.message || 'Unknown'}`);
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\nDone! Visit https://resistproject.com/');
}

main().catch(console.error);
