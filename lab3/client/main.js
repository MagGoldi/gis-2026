import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { applyStyle } from 'ol-mapbox-style';

import MAPBOX_STYLE from './style.json';



const overtureSource = new VectorSource({
  url: '/overture.geojson',
  format: new GeoJSON(),
});

const overtureLayer = new VectorLayer({ source: overtureSource });

applyStyle(overtureLayer, MAPBOX_STYLE, 'overture');


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({ source: new OSM() }),
    overtureLayer,
  ],
  view: new View({
    center: fromLonLat([49.2957, 53.5936]),
    zoom: 17,
  }),
});


const statsEl = document.getElementById('stats');

overtureSource.once('featuresloadend', () => {
  const features = overtureSource.getFeatures();
  const counts = { my: 0, osm: 0, ml: 0 };
  features.forEach(f => {
    const st = f.get('source_type');
    if (st in counts) counts[st]++;
  });
  statsEl.innerHTML =
    `Зданий: <span>${features.length}</span> &nbsp;|&nbsp; ` +
    `my: <span>${counts.my}</span> &nbsp;` +
    `osm: <span>${counts.osm}</span> &nbsp;` +
    `ml: <span>${counts.ml}</span>`;
});


const tooltip = document.getElementById('tooltip');

map.on('pointermove', (evt) => {
  if (evt.dragging) { tooltip.style.display = 'none'; return; }

  const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, {
    layerFilter: l => l === overtureLayer,
    hitTolerance: 2,
  });

  if (!feature) {
    tooltip.style.display = 'none';
    map.getViewport().style.cursor = '';
    return;
  }

  map.getViewport().style.cursor = 'pointer';

  const src = feature.get('source_type') || '—';
  const name = feature.get('name') || '—';
  const cls = feature.get('class') || '—';
  const h = feature.get('height') || '—';
  const fl = feature.get('num_floors') || '—';

  const srcLabels = { my: 'Пользовательский', osm: 'OpenStreetMap', ml: 'ML' };
  const srcColors = { my: '#22c55e', osm: '#3b82f6', ml: '#f97316' };

  tooltip.innerHTML =
    `<strong style="color:${srcColors[src] || '#fff'}">${srcLabels[src] || src}</strong>` +
    `Название: ${name}<br>` +
    `Класс: ${cls}<br>` +
    `Высота: ${h} м<br>` +
    `Этажей: ${fl}`;

  const [px, py] = evt.pixel;
  const margin = 12;
  tooltip.style.left = `${px + margin}px`;
  tooltip.style.top = `${py + margin}px`;
  tooltip.style.display = 'block';
});

map.on('click', (evt) => {
  const feature = map.forEachFeatureAtPixel(evt.pixel, f => f, {
    layerFilter: l => l === overtureLayer,
    hitTolerance: 2,
  });
  if (!feature) return;
  const id = feature.get('id') || '';
  if (id) console.info('Overture building id:', id);
});
