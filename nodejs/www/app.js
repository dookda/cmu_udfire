// let geoserver = "http://150.95.80.114:8080/geoserver"
let geoserver = "http://localhost:8080/geoserver"

const map = L.map('map', {
    center: [17.868925397129943, 100.31221166785994],
    zoom: 11
})

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    lyr: 'basemap'
});

const CartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    lyr: 'basemap'
});

const grod = L.tileLayer('https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    lyr: 'basemap',
    zIndex: 0
});

const ghyb = L.tileLayer('https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    lyr: 'basemap',
    zIndex: 0
});

const gter = L.tileLayer('https://{s}.google.com/vt/lyrs=t,m&x={x}&y={y}&z={z}', {
    name: "base",
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    lyr: 'basemap',
    zIndex: 0
});

const prov = L.tileLayer.wms(geoserver + "/indx/wms?", {
    layers: 'indx:ud_pro_4326',
    format: 'image/png',
    transparent: true,
    CQL_FILTER: 'pro_code=53'
});

const amp = L.tileLayer.wms(geoserver + "/indx/wms?", {
    layers: 'indx:ud_amp_4326',
    format: 'image/png',
    transparent: true,
    CQL_FILTER: 'pro_code=53'
});

const tam = L.tileLayer.wms(geoserver + "/indx/wms?", {
    layers: 'indx:ud_tam_4326',
    format: 'image/png',
    transparent: true,
    CQL_FILTER: 'pro_code=53'
});

const baseMap = {
    "OSM": osm,
    "แผนที่ CartoDB": CartoDB.addTo(map),
    "แผนที่ถนน": grod,
    "แผนที่ภาพถ่าย": ghyb,
    "แผนที่ภูมิประเทศ": gter
}

const overlayMap = {
    "ขอบจังหวัด": prov,
    "ขอบอำเภอ": amp.addTo(map),
    "ขอบตำบล": tam.addTo(map)
}

L.control.layers(baseMap, overlayMap).addTo(map);

let wmsList = [];
// axios.get('/api/listndvi').then((res) => {
//     console.log(res);
//     res.data.layers.layer.forEach(i => {
//         wmsList.push(i.name);
//     });
// });

let wmsLyr = [];
const addLayer = async () => {

    let indx = document.querySelector('input[name="indx"]:checked').value;
    let ndviItem = document.getElementById('ndvidate');
    let range = document.getElementById('range').value;
    // console.log(range);

    wmsLyr = [];
    document.getElementById("datefocus").value = ndviItem.value;

    let dtxt = "indx:" + indx + "_" + ndviItem.value.replace("-", "").replace("-", "");
    console.log(dtxt);
    wmsLyr.push(dtxt)
    await map.eachLayer(i => {
        if (i.options.name == "indx") {
            map.removeLayer(i)
        }
    })
    // console.log(dtxt);
    let lyr = await L.tileLayer.wms(geoserver + "/wms?", {
        layers: dtxt,
        format: "image/png",
        transparent: true,
        styles: "ndvi",
        opacity: range,
        zIndex: 6,
        name: "indx"
    })

    lyr.addTo(map)

    fetch('/api/getcommuforest').then(res => res.json()).then(data => console.log(data))
    showStat()
}

// ndviItem.onchange = addLayer;

var dom = document.getElementById('chart');
var echart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});

var option = {
    grid: {
        top: '10%',
        bottom: '10%',
        left: '15%',
        right: '5%',
    },
    xAxis: {
        type: 'category',
        name: 'Date',
        nameLocation: 'center',
        nameGap: 30,
    },
    yAxis: {
        type: 'value',
        max: 1,
        name: 'NDVI',
        nameLocation: 'center',
        nameGap: 30,
    },
    series: [
        {
            // data: [120],
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
            }
        }
    ]
};

if (option && typeof option === 'object') {
    echart.setOption(option);
}

window.addEventListener('resize', echart.resize);

let showStat = async (e) => {
    // let lyrs = wmsLyr.toString();
    // let pnt = await map.latLngToContainerPoint(e.latlng, map.getZoom());
    // let size = await map.getSize();
    // let bbox = await map.getBounds().toBBoxString();
    // let indx = document.querySelector('input[name="indx"]:checked').value;

    // let lyrInfoUrl = geoserver + "/wms?SERVICE=WMS" +
    //     "&VERSION=1.1.1&REQUEST=GetFeatureInfo" +
    //     "&QUERY_LAYERS=" + lyrs +
    //     "&LAYERS=" + lyrs +
    //     "&Feature_count=300" +
    //     "&INFO_FORMAT=application/json" +
    //     "&X=" + Math.round(pnt.x) +
    //     "&Y=" + Math.round(pnt.y) +
    //     "&SRS=EPSG:4326" +
    //     "&WIDTH=" + size.x +
    //     "&HEIGHT=" + size.y +
    //     "&BBOX=" + bbox;
    // let xAxis = [];
    // let series = [];

    fetch(lyrInfoUrl).then(res => res.json()).then(data => {
        if (data.features.length > 0) {
            console.log("ddd");
        }
    })
}

let showIndx = async (e) => {
    let lyrs = wmsLyr.toString();
    let pnt = await map.latLngToContainerPoint(e.latlng, map.getZoom());
    let size = await map.getSize();
    let bbox = await map.getBounds().toBBoxString();
    let datefocus = document.getElementById("datefocus").value
    let indx = document.querySelector('input[name="indx"]:checked').value;

    let lyrInfoUrl = geoserver + "/wms?SERVICE=WMS" +
        "&VERSION=1.1.1&REQUEST=GetFeatureInfo" +
        "&QUERY_LAYERS=" + lyrs +
        "&LAYERS=" + lyrs +
        "&Feature_count=300" +
        "&INFO_FORMAT=application/json" +
        "&X=" + Math.round(pnt.x) +
        "&Y=" + Math.round(pnt.y) +
        "&SRS=EPSG:4326" +
        "&WIDTH=" + size.x +
        "&HEIGHT=" + size.y +
        "&BBOX=" + bbox;
    // console.log(lyrInfoUrl);
    let xAxis = [];
    let series = [];

    fetch(lyrInfoUrl).then(res => res.json()).then(data => {
        if (data.features.length > 0) {
            data.features.map(async (i, k) => {
                document.getElementById("ndvitxt").innerHTML = `<div class="desc">lat: ${e.latlng.lat} 
                            <br>lon: ${e.latlng.lng}
                            <br>${indx}: ${i.properties.GRAY_INDEX.toFixed(3)} 
                            <br>วันที่: ${datefocus}`;
                xAxis.push(k);
                series.push(i.properties.GRAY_INDEX.toFixed(3));
            })

            echart.setOption({
                xAxis: {
                    type: 'category',
                    data: [datefocus],
                },
                yAxis: {
                    type: 'value',
                    max: 1,
                    min: -1,
                },
                series: [
                    {
                        data: series,
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.2)'
                        }
                    }
                ]
            })
        }
    })
}

let getStat = (indx, yyyymmdd, latitude, longitude) => {
    // let indx = document.querySelector('input[name="indx"]:checked').value;
    // let ndviItem = document.getElementById('ndvidate');
    // let url = `http://150.95.80.114:3180/getpixelvalue/[string:index]/[string:yyyymmdd]/[float:latitude]/[float:longitude]`
    // fetch()
}

map.on("click", async (e) => {
    showIndx(e)
})

