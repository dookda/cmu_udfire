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
    // "ขอบจังหวัด": prov,
    // "ขอบอำเภอ": amp.addTo(map),
    // "ขอบตำบล": tam.addTo(map)
}

L.control.layers(baseMap, overlayMap).addTo(map);

let wmsList = [];
let wmsLyr = [];

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
    document.getElementById("datefocus").value = ndviItem.value;

    let dtxt = "indx:" + indx + "_" + ndviItem.value.replace("-", "").replace("-", "");

    wmsLyr.push(dtxt)

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
    showStat(indx, ndviItem.value)
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


var forestDom = document.getElementById('chart_commu_forest');
var forestChart = echarts.init(forestDom);

var forestOption = {
    title: {
        text: 'ปริมาณเชื้อเพลิง'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    legend: {},
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
        data: [
            "บ้านปากทับ",
            "บ้านงอมถ้ำ",
            "ห้วยแมง",
            "ป่าคาย",
            "ปางวัว",
            "หนองไผ่",
            "บ้านคุ้งยาง",
            "บ้านผาจักร",
            "บ้ายห้วยปอบ",
            "บ้านนาตารอด"
        ]
    },
    series: []
};

if (forestOption && typeof forestOption === 'object') {
    forestChart.setOption(forestOption);
}

window.addEventListener('resize', forestChart.resize);

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

        iconSize: [38, 38],
        iconAnchor: [12, 37],
        popupAnchor: [5, -30]
    });
    L.marker([lat, lng], { icon, name: "station" }).bindPopup(`${name}<br>ดัชนี ${ndx} : ${val.toFixed(2)} <br> วันที่${dd}`).addTo(map)
}
let showStat = async (indx, ndviItem) => {
    // var aa = []
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
            document.getElementById(`${k.div}`).value = data.features[0].properties.GRAY_INDEX
            showMarker(k.name, k.lat, k.lng, indx, ndviItem, data.features[0].properties.GRAY_INDEX)
        })
    })

    setTimeout(() => {
        forestChart.setOption({
            series: [
                {
                    name: 'ปริมาณเชื้อเพลิง',
                    type: 'bar',
                    data: [
                        document.getElementById("a").value,
                        document.getElementById("b").value,
                        document.getElementById("c").value,
                        document.getElementById("d").value,
                        document.getElementById("e").value,
                        document.getElementById("f").value,
                        document.getElementById("g").value,
                        document.getElementById("h").value,
                        document.getElementById("i").value,
                        document.getElementById("j").value
                    ]
                }
            ]
        })
    }, 1000)
}

let showIndx = async (e) => {
    // console.log(e.latlng);
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

