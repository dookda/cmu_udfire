
let geoserver = "http://150.95.80.114:8080/geoserver"
// let geoserver = "http://localhost:8080/geoserver"

const map = L.map('map', {
    center: [17.728925397129943, 100.49221166785994],
    zoom: 9
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

var fc = L.featureGroup()
const overlayMap = {
    "จุดความร้อนปัจจุบัน": fc.addTo(map),
    "ขอบจังหวัด": prov,
    "ขอบอำเภอ": amp.addTo(map),
    "ขอบตำบล": tam.addTo(map)
}

L.control.layers(baseMap, overlayMap).addTo(map);


var legend = L.control({ position: "bottomleft" });

function showLegend() {
    let indx = document.querySelector('input[name="indx"]:checked').value;
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += `<button class="btn btn-sm" onClick="hideLegend()"><i class="bi bi-chevron-down"></i>ซ่อนสัญลักษณ์</button><br>`;
        div.innerHTML += `<b></b>${indx}</br>`;
        div.innerHTML += '<i style="background: #1a9850"></i><span class="kanit">1.00</span><br>';
        div.innerHTML += '<i style="background: #229b51"></i><span class="kanit">0.75</span><br>';
        div.innerHTML += '<i style="background: #91cf60"></i><span class="kanit">0.25</span><br>';
        div.innerHTML += '<i style="background: #fee08b"></i><span class="kanit">0</span><br>';
        div.innerHTML += '<i style="background: #fc8d59"></i><span class="kanit">-0.25</span><br>';
        div.innerHTML += '<i style="background: #db3d2d"></i><span class="kanit">-0.75</span><br>';
        div.innerHTML += '<i style="background: #d73027"></i><span class="kanit">-1.00</span><br>';
        // div.innerHTML += '<i style="background: #bd0000"></i><span class="kanit">ฝนตกหนักมาก</span><br>';
        return div;
    };
    legend.addTo(map);
}

// showLegend = true;
// var toggleLegend = function () {
//     if (showLegend === true) {
//         $('.legend').hide();
//         showLegend = false;
//     } else {
//         $('.legend').show();
//         showLegend = true;
//     }
// }

function hideLegend() {
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend')
        div.innerHTML += `<button class="btn btn-sm" onClick="showLegend()"><i class="bi bi-chevron-up"></i>แสดงสัญลักษณ์</button>`;
        return div;
    };
    legend.addTo(map);
}

let wmsList = [];
let wmsLyr = [];
let ndviLyr = [];

let removeLayer = (n) => {
    map.eachLayer(i => i.options.name == n ? map.removeLayer(i) : null)
}

const addLayer = async () => {
    removeLayer("indx")
    let indx = document.querySelector('input[name="indx"]:checked').value;
    let ndviItem = document.getElementById('ndvidate');
    let range = document.getElementById('range').value;
    // console.log(range);

    wmsLyr = [];
    ndviLyr = [];
    document.getElementById("datefocus").value = ndviItem.value;

    let dtxt = "indx:" + indx + "_" + ndviItem.value.replace("-", "").replace("-", "");
    wmsLyr.push(dtxt)

    let ndvitxt = "indx:ndvi_" + ndviItem.value.replace("-", "").replace("-", "");
    ndviLyr.push(ndvitxt)

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
    // showForestIndx(indx, ndviItem.value)
    // showForestBiomass(indx, ndviItem.value)
    showFiChart(indx, ndviItem.value)
}

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

var fiDom = document.getElementById('chart_fire_intensity');
var fiChart = echarts.init(fiDom);

var fiOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            crossStyle: {
                color: '#999'
            }
        }
    },
    // toolbox: {
    //     feature: {
    //         dataView: { show: true, readOnly: false },
    //         magicType: { show: true, type: ['line', 'bar'] },
    //         restore: { show: true },
    //         saveAsImage: { show: true }
    //     }
    // },
    legend: {
        // data: ['Evaporation', 'Precipitation', 'Temperature']
    },

};

if (fiOption && typeof fiOption === 'object') {
    fiChart.setOption(fiOption);
}

window.addEventListener('resize', fiOption.resize);

let locationVill = [
    { div: 'a', name: "บ้านปากทับ", lat: 17.748892, lng: 100.422899 },
    { div: 'b', name: "บ้านงอมถ้ำ", lat: 17.972817, lng: 100.581703 },
    { div: 'c', name: "ห้วยแมง", lat: 17.605355, lng: 100.558604 },
    { div: 'd', name: "ป่าคาย", lat: 17.52914, lng: 100.339262 },
    { div: 'e', name: "ปางวัว", lat: 17.83773, lng: 100.171323 },
    { div: 'f', name: "หนองไผ่", lat: 17.599284, lng: 100.378302 },
    { div: 'g', name: "บ้านคุ้งยาง", lat: 17.625081, lng: 100.291825 },
    { div: 'h', name: "บ้านผาจักร", lat: 17.62646, lng: 100.269156 },
    { div: 'i', name: "บ้ายห้วยปอบ", lat: 17.781632, lng: 100.245051 },
    { div: 'j', name: "บ้านนาตารอด", lat: 17.681839, lng: 100.374567 }
]

let showMarker = (name, lat, lng, ndx, dd, val) => {
    var icon = L.icon({
        iconUrl: './pin.png',

        iconSize: [30, 30],
        iconAnchor: [12, 37],
        popupAnchor: [5, -30]
    });
    L.marker([lat, lng], { icon, name: "station" }).bindPopup(`${name}<br>ดัชนี ${ndx} : ${val.toFixed(2)} <br> วันที่ ${dd}`).addTo(map)
}

let fireIntensity = (ndvi) => {
    let biomass = ndvi < 0 ? 0 : ((100007 * (1 - ndvi))) / 1000000
    let A = 1.2
    let B = 1.2
    let C = 1.8
    let D = 1958000
    let fi = ((biomass * A * B * C * D) / 60) / 10

    return fi
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
                document.getElementById("ndvitxt").innerHTML = `<div class="desc">lat: ${(e.latlng.lat).toFixed(3)}
                            <br>lon: ${(e.latlng.lng).toFixed(3)}
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


let showFiChart = async (indx, ndviItem) => {
    var valNdvi = []
    var valFi = []
    var staName = []
    removeLayer("station")

    locationVill.forEach(async (k) => {
        let latlng = { lat: k.lat, lng: k.lng }
        let lyrs = ndviLyr.toString();
        let pnt = await map.latLngToContainerPoint(latlng, map.getZoom());
        let size = await map.getSize();
        let bbox = await map.getBounds().toBBoxString();

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

        await fetch(lyrInfoUrl).then(res => res.json()).then(async (data) => {
            // console.log(data);
            staName.push(k.name)
            valNdvi.push(data.features[0].properties.GRAY_INDEX.toFixed(3))
            let fi = fireIntensity(data.features[0].properties.GRAY_INDEX)
            valFi.push(fi.toFixed(3))
            // document.getElementById(`${k.div}`).value = data.features[0].properties.GRAY_INDEX
            showMarker(k.name, k.lat, k.lng, indx, ndviItem, data.features[0].properties.GRAY_INDEX)
            showLegend()
        })
    })
    setTimeout(() => {
        // console.log(staName, valNdvi, valFi);
        fiChart.setOption({
            xAxis: [
                {
                    type: 'category',
                    data: staName,
                    axisPointer: {
                        type: 'shadow'
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'ndvi',
                    // min: 0,
                    // max: 250,
                    // interval: 50,
                    axisLabel: {
                        formatter: '{value} '
                    }
                },
                {
                    type: 'value',
                    name: 'fire intensity',
                    // min: 0,
                    // max: 25,
                    // interval: 5,
                    axisLabel: {
                        formatter: '{value} kw/m'
                    }
                }
            ],
            series: [
                {
                    name: 'ndvi',
                    type: 'bar',
                    tooltip: {
                        valueFormatter: function (value) {
                            return value + ' ';
                        }
                    },
                    data: valNdvi
                },
                {
                    name: 'fire intensity',
                    type: 'line',
                    yAxisIndex: 1,
                    tooltip: {
                        valueFormatter: function (value) {
                            return value + ' kw/m';
                        }
                    },
                    data: valFi
                }
            ]
        })
    }, 2500)
}

let hpData = axios.get("https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia/c56f7d70bc06160e3c443a592fd9c87e/?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=ms:fires_snpp_24hrs&STARTINDEX=0&COUNT=5000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX=-90,-180,90,180,urn:ogc:def:crs:EPSG::4326&outputformat=geojson");
let onEachFeatureHotspot = (feature, layer) => {
    if (feature.properties) {
        layer.bindPopup(
            `<span class="kanit"><b>ตำแหน่งจุดความร้อน</b>
            <br/>ข้อมูลจาก VIIRS
            <br/>ตำแหน่งที่พบ : ${feature.properties.latitude}, ${feature.properties.longitude} 
            <br/>ค่า Brightness temperature: ${feature.properties.brightness} Kelvin
            <br/>วันที่: ${feature.properties.acq_datetime} UTC`
        );
    }
}

let loadHotspot = async () => {
    let hp = await hpData;
    const fs = hp.data.features;
    var geojsonMarkerOptions = {
        radius: 6,
        fillColor: "#ff5100",
        color: "#a60b00",
        weight: 0,
        opacity: 1,
        fillOpacity: 0.8
    };

    await L.geoJSON(fs, {
        filter: function (feature) {
            if (feature.geometry.coordinates[0] > 96.295861 && feature.geometry.coordinates[0] < 106.113154) {
                if (feature.geometry.coordinates[1] > 5.157973 && feature.geometry.coordinates[1] < 20.221918) {
                    // myModal.hide();
                    return feature
                }
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        name: "lyr",
        onEachFeature: onEachFeatureHotspot
    }).addTo(fc)
}

axios.get('/api/getupdate').then(r => {
    let updated = moment(r.data.data[0].dt).format("DD/MM/YYYY");
    document.getElementById("updated").innerHTML = updated
})

loadHotspot();

map.on("click", async (e) => {
    showIndx(e)
})

const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1; // Months start at 0!
let dd = today.getDate() - 8;
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;
const formattedToday = yyyy + '-' + mm + '-' + dd;
document.getElementById('ndvidate').value = formattedToday;

setTimeout(() => {
    addLayer()
}, 1000)

console.log("พัฒนาโดย: sakda.homhuan@cmu.ac.th")