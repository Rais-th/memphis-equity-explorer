export const SOURCES = {
  councilDistricts: {
    name: "Memphis City Council Districts 2023",
    owner: "City of Memphis / OPM",
    url: "https://services6.arcgis.com/FayuIc8kjcIuYMDI/arcgis/rest/services/DBO_Memphis_Council_Districts_2023/FeatureServer/0",
  },
  trafficStops: {
    name: "MPD Traffic Stops",
    owner: "Memphis Police Department",
    url: "https://services2.arcgis.com/saWmpKJIUAjyyNVc/arcgis/rest/services/MPD_Traffic_Stops/FeatureServer/0",
  },
  trafficCitations: {
    name: "MPD Traffic Citations",
    owner: "Memphis Police Department",
    url: "https://services2.arcgis.com/saWmpKJIUAjyyNVc/arcgis/rest/services/MPD_Traffic_Citations/FeatureServer/0",
  },
  incidents: {
    name: "MPD Public Safety Incidents (NIBRS)",
    owner: "Memphis Police Department",
    url: "https://services2.arcgis.com/saWmpKJIUAjyyNVc/arcgis/rest/services/MPD_Public_Safety_Incidents/FeatureServer/0",
  },
  fireServices: {
    name: "Fire Services Metrics (911 / EMS / Fire response)",
    owner: "Memphis Fire Department",
    url: "https://services2.arcgis.com/saWmpKJIUAjyyNVc/arcgis/rest/services/Fire_Services_Metrics/FeatureServer/0",
  },
} as const;

export const SOURCE_PORTAL = "https://data.memphistn.gov";
