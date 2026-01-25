const fs = require('fs');
const http = require('http');

const token = fs.readFileSync('/home/lknipko/civic-action-wiki/wiki-js-key.txt', 'utf8').trim();

// Get arguments: node update-page.js <page-id> <content-file>
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node update-page.js <page-id> <content-file>');
  process.exit(1);
}

const [pageId, contentFile] = args;
const content = fs.readFileSync(contentFile, 'utf8');

const mutation = `
mutation UpdatePage($id: Int!, $content: String!, $tags: [String]!) {
  pages {
    update(
      id: $id
      content: $content
      tags: $tags
    ) {
      responseResult {
        succeeded
        errorCode
        message
      }
    }
  }
}
`;

const variables = {
  id: parseInt(pageId),
  content: content,
  tags: []
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
    try {
      const result = JSON.parse(data);
      if (result.data?.pages?.update?.responseResult?.succeeded) {
        console.log(`✓ Updated page ID: ${pageId}`);
      } else {
        console.log('✗ Failed:', result.data?.pages?.update?.responseResult?.message || JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end();
