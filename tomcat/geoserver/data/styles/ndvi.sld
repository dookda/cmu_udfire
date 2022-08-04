<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" 
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" 
    xmlns="http://www.opengis.net/sld" 
    xmlns:ogc="http://www.opengis.net/ogc" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>NDVI</Name>
    <UserStyle>
      <Title>NDVI</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <ColorMap>
              <ColorMapEntry color="#d73027" quantity="-0.75" />
              <ColorMapEntry color="#fc8d59" quantity="-0.25" />
              <ColorMapEntry color="#fee08b" quantity="0.0" />
              <ColorMapEntry color="#91cf60" quantity="0.25" />
              <ColorMapEntry color="#1a9850" quantity="0.75"/>
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>