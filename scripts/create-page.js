const fs = require('fs');
const http = require('http');

const token = fs.readFileSync('/home/lknipko/civic-action-wiki/wiki-js-key.txt', 'utf8').trim();

// Get arguments: node create-page.js <content-file> <path> <title> <description>
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log('Usage: node create-page.js <content-file> <path> <title> <description>');
  process.exit(1);
}

const [contentFile, pagePath, title, description] = args;
const content = fs.readFileSync(contentFile, 'utf8');

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
      responseResult {
        succeeded
        errorCode
        message
      }
      page {
        id
        path
        title
      }
    }
  }
}
`;

const variables = {
  content: content,
  description: description,
  path: pagePath,
  title: title
};

const postData = JSON.stringify({
  query: mutation,
  variables: variables
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.data?.pages?.create?.responseResult?.succeeded) {
      console.log(`✓ Created: ${result.data.pages.create.page.path} (ID: ${result.data.pages.create.page.id})`);
    } else {
      console.log('✗ Failed:', result.data?.pages?.create?.responseResult?.message || JSON.stringify(result));
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end();
