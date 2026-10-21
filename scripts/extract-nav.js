const fs = require('fs');
const html = fs.readFileSync('tradoxes.html', 'utf8');

// Cari navigasi di html
const navMatches = html.match(/<nav[\s\S]*?<\/nav>/gi) || [];
navMatches.forEach((nav, i) => {
  console.log(`--- NAV ${i} ---`);
  const links = [...nav.matchAll(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  links.forEach(l => {
    const text = l[2].replace(/<[^>]+>/g, '').trim();
    console.log(l[1], '-->', text);
  });
});
