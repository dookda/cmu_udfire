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

const overlayMap = {
    "ขอบจังหวัด": prov,
    "ขอบอำเภอ": amp.addTo(map),
    "ขอบตำบล": tam.addTo(map)
}

L.control.layers(baseMap, overlayMap).addTo(map);


var legend = L.control({ position: "bottomleft" });

function showLegend() {
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += `<button class="btn btn-sm" onClick="hideLegend()"><i class="bi bi-chevron-down"></i>ซ่อนสัญลักษณ์</button><br>`;
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
//   if (showLegend === true) {
//     $('.legend').hide();
//     showLegend = false;
//   } else {
//     $('.legend').show();
//     showLegend = true;
//   }
// }

function hideLegend() {
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend')
        div.innerHTML += `<button class="btn btn-sm" onClick="showLegend()"><i class="bi bi-chevron-up"></i>แสดงสัญลักษณ์</button>`;
        return div;
    };
    legend.addTo(map);
}

hideLegend()

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
    showForestIndx(indx, ndviItem.value)
    showForestBiomass(indx, ndviItem.value)
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

var forestDom = document.getElementById('chart_forest_indx');
var forestChart = echarts.init(forestDom);

var forestOption = {
    title: {
        text: 'ค่าดัชนีของป่าชุมชน'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {
        // Try 'horizontal' 'vertical'
        show: false,
        orient: 'horizontal',
        right: 10,
        top: 'bottom'
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
    },
    yAxis: {
        type: 'category',
        data: []
    },
    series: []
};

if (forestOption && typeof forestOption === 'object') {
    forestChart.setOption(forestOption);
}

window.addEventListener('resize', forestChart.resize);

var biomassDom = document.getElementById('chart_forest_biomass');
var biomassChart = echarts.init(biomassDom);

var biomassOption = {
    title: {
        text: 'ความรุนแรงไฟ (w/m)'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {
        // Try 'horizontal' 'vertical'
        show: false,
        orient: 'horizontal',
        right: 10,
        top: 'bottom'
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
    },
    yAxis: {
        type: 'category',
        data: []
    },
    series: []
};

if (biomassOption && typeof biomassOption === 'object') {
    biomassChart.setOption(biomassOption);
}

window.addEventListener('resize', biomassOption.resize);

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

let showForestIndx = async (indx, ndviItem) => {
    var indxArr = []
    var indxName = []
    removeLayer("station")
    locationVill.forEach(async (k) => {
        let latlng = { lat: k.lat, lng: k.lng }
        let lyrs = wmsLyr.toString();
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
            indxArr.push(data.features[0].properties.GRAY_INDEX)
            indxName.push(k.name)
            // document.getElementById(`${k.div}`).value = data.features[0].properties.GRAY_INDEX
            showMarker(k.name, k.lat, k.lng, indx, ndviItem, data.features[0].properties.GRAY_INDEX)
        })
    })

    setTimeout(() => {
        forestChart.setOption({
            title: {
                text: `ค่าดัชนี ${indx} ของป่าชุมชน`,
            },
            yAxis: {
                type: 'category',
                data: indxName
            },
            series: [
                {
                    name: ` ${indx}`,
                    type: 'bar',
                    data: indxArr
                }
            ]
        })
    }, 1000)
}

let fireIntensity = (ndvi) => {
    let M = ((10007 * (1 - ndvi)) - 2936.8) / 1000000   // biomass
    console.log(M);
    let h = 19580                       // kj/kg
    let a = 1.5
    let b = 1.2
    let c = 1.8
    return ((h * M * a * b * c) / 60) > 0 ? ((h * M * a * b * c) / 60) * 100 : 0
}

let showForestBiomass = async (indx, ndviItem) => {
    var indxArr = []
    var indxName = []
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

            indxName.push(k.name)
            let fi = fireIntensity(data.features[0].properties.GRAY_INDEX)
            indxArr.push(fi.toFixed(3))
            // document.getElementById(`${k.div}`).value = data.features[0].properties.GRAY_INDEX
            // showMarker(k.name, k.lat, k.lng, indx, ndviItem, data.features[0].properties.GRAY_INDEX)
        })
    })

    setTimeout(() => {
        biomassChart.setOption({
            title: {
                text: `ค่าความรุนแรงไฟ (w/m)`,
            },
            yAxis: {
                type: 'category',
                data: indxName
            },
            series: [
                {
                    name: `ความรุนแรงไฟ (w/m)`,
                    type: 'bar',
                    data: indxArr
                }
            ]
        })
    }, 1000)
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

map.on("click", async (e) => {
    showIndx(e)
})

