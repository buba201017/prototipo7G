const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const polys = data.features.map(f => {
        if (!f.geometry) return null;
        if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
          return f.geometry;
        }
        return null;
      }).filter(Boolean);
      fs.writeFileSync('src/data/worldMap.ts', 'export const worldPolygons = ' + JSON.stringify(polys) + ';\n');
      console.log('Successfully wrote worldMap.ts');
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', e => console.error(e));
