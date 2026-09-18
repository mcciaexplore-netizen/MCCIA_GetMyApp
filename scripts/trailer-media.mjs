import fs from 'node:fs';
import path from 'node:path';

// Local equivalent of Vercel's static video serving, including seek requests.
export function serveTrailer(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!pathname.startsWith('/trailers/')) return false;
  const filename = pathname.slice('/trailers/'.length);
  if (!/^[a-z0-9-]+\.mp4$/.test(filename) || !['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(404); res.end(); return true;
  }
  const file = path.resolve('dist/trailers', filename);
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return true; }
  const size = fs.statSync(file).size;
  let start = 0, end = size - 1;
  const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes' };
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (match) {
      start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    }
    if (!match || (!match[1] && !match[2]) || start > end || start >= size) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return true;
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = end - start + 1;
  res.writeHead(req.headers.range ? 206 : 200, headers);
  if (req.method === 'HEAD') res.end();
  else fs.createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
  return true;
}
