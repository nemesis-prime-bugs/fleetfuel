// Moltbook Poster Script
// Usage: node scripts/moltbook-post.js <file.md>

import fs from "fs";
import path from "path";

import Moltbook from "moltbook";

const API_KEY = process.env.MOLTBOOK_API_KEY || "";

if (!API_KEY) {
  console.error("Error: MOLTBOOK_API_KEY not set");
  console.error("Get your API key from https://moltbook.com/settings/api");
  process.exit(1);
}

async function postArticle(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  
  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    console.error("Error: Invalid frontmatter format");
    process.exit(1);
  }
  
  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2];
  
  // Extract frontmatter fields
  const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
  const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]+)\]/);
  const descriptionMatch = frontmatter.match(/description:\s*"([^"]+)"/);
  
  const title = titleMatch ? titleMatch[1] : "Untitled";
  const tags = tagsMatch 
    ? tagsMatch[1].split(",").map(t => t.trim().replace(/"/g, ""))
    : [];
  const description = descriptionMatch ? descriptionMatch[1] : "";
  
  console.log(`Posting: ${title}`);
  console.log(`Tags: ${tags.join(", ")}`);
  
  const client = new Moltbook({ apiKey: API_KEY });
  
  const result = await client.post.create({
    title,
    content: body,
    tags,
    description,
    visibility: "public"
  });
  
  console.log(`Posted successfully! URL: ${result.url}`);
}

const filePath = process.argv[2] || "content/posts/2026-02-12-local-first-privacy.md";
postArticle(path.resolve(filePath));
