const map = L.map('map', {
    center: [17.848925397129943, 100.33221166785994],
    zoom: 11
})

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    lyr: 'basemap'
});

const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    lyr: 'basemap'
});

const grod = L.tileLayer('https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    lyr: 'basemap'
});

const ghyb = L.tileLayer('https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    lyr: 'basemap'
});

var ndvi = L.tileLayer.wms("http://150.95.80.114:8080/geoserver/wms?", {
    layers: 'ndvi:ndvi_20220101',
    format: 'image/png',
    transparent: true,
    styles: 'ndvi',
    name: "ndvi"
});

const baseMaps = {
    "แผนที่ osm": osm,
    "แผนที่ CartoDB": CartoDB_Positron.addTo(map),
    "แผนที่ google road": grod,
    "แผนที่ google hybride": ghyb
}

var overlayMaps = {
    "ndvi": ndvi.addTo(map)
}

let ndviItem = document.getElementById('ndvidate')
axios.get('/api/listndvi').then((res) => {
    res.data.layers.layer.forEach(i => {
        // console.log(i.name);
        const nane = i.name.split(":")
        ndviItem.innerHTML += `<option value="${nane[1]}">${nane[1]}</option>`
    });
});


L.control.layers(baseMaps, overlayMaps).addTo(map)

function removeLayer() {

}

async function addLayer(e) {
    await map.eachLayer(i => {
        if (i.options.name == "ndvi") {
            map.removeLayer(i)
        }
    })

    let a = await L.tileLayer.wms("http://150.95.80.114:8080/geoserver/wms?", {
        layers: 'ndvi:' + e.target.value,
        format: "image/png",
        transparent: true,
        styles: "ndvi",
        zIndex: 3,
        name: "ndvi"
    })

    a.addTo(map)
}

ndviItem.onchange = addLayer;