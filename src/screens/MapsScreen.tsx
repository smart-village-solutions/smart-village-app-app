import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MapboxComponent, MaplibreComponent, RNMapComponent } from '../components';
import { MapMarker } from '../types';

export const MapsScreen = ({ route }: { route: { params: any } }) => {
  const { mapComponent } = route.params || {};
  const [selectedMarker, setSelectedMarker] = useState<string | undefined>(undefined);
  const locations: MapMarker[] = locationGenerator();

  if (!locations.length) {
    return <View />;
  }

  console.log(selectedMarker);

  const location = [
    {
      iconName: '',
      id: '1',
      position: { latitude: 52.141720850254, longitude: 12.582997157407 },
      serviceName: 'Service Name',
      title: 'Title'
    }
  ];
  if (mapComponent === 'Mapbox') {
    return (
      <MapboxComponent
        calloutTextEnabled
        isMyLocationButtonVisible
        onMyLocationButtonPress={() => console.log('My Location Button Pressed')}
        isMaximizeButtonVisible
        onMaximizeButtonPress={() => console.log('Maximize Button Pressed')}
        clusterDistance={50}
        clusteringEnabled
        locations={locations}
        geometryTourData={geometryTourData}
        mapStyle={styles.map}
        onMarkerPress={setSelectedMarker}
        selectedMarker={selectedMarker}
      />
    );
  } else if (mapComponent === 'react-native-maps') {
    return (
      <RNMapComponent
        calloutTextEnabled
        isMyLocationButtonVisible
        onMyLocationButtonPress={() => console.log('My Location Button Pressed')}
        isMaximizeButtonVisible
        onMaximizeButtonPress={() => console.log('Maximize Button Pressed')}
        clusterDistance={50}
        clusteringEnabled
        locations={locations}
        geometryTourData={geometryTourData}
        mapStyle={styles.map}
        onMarkerPress={setSelectedMarker}
        selectedMarker={selectedMarker}
      />
    );
  } else if (mapComponent === 'Maplibre') {
    return (
      <MaplibreComponent
        calloutTextEnabled
        isMyLocationButtonVisible
        onMyLocationButtonPress={() => console.log('My Location Button Pressed')}
        isMaximizeButtonVisible
        onMaximizeButtonPress={() => console.log('Maximize Button Pressed')}
        clusterDistance={50}
        clusteringEnabled
        locations={locations}
        geometryTourData={geometryTourData}
        mapStyle={styles.map}
        onMarkerPress={setSelectedMarker}
        selectedMarker={selectedMarker}
      />
    );
  }

  return <View />;
};

const styles = StyleSheet.create({
  map: {
    flex: 1
  }
});

type TLocation = {
  iconName: string;
  id: string;
  position: { latitude: number; longitude: number };
  serviceName: string;
  title: string;
};

const locationGenerator = () => {
  const location = [] as TLocation[];
  const baseLatitude = 52.141720850254;
  const baseLongitude = 12.582997157407;
  const variation = 0.5; // Variation to ensure coordinates are not too far apart

  for (let i = 0; i < 10000; i++) {
    const latitude = baseLatitude + (Math.random() - 1) * variation;
    const longitude = baseLongitude + (Math.random() - 1) * variation;

    location.push({
      iconName: '',
      id: i.toString(),
      position: { latitude, longitude },
      serviceName: `Service Name ${i}`,
      title: `Title ${i}`
    });
  }

  return location;
};

const geometryTourData = [
  {
    latitude: 52.1363839,
    longitude: 12.5948407
  },
  {
    latitude: 52.1366122,
    longitude: 12.5927522
  },
  {
    latitude: 52.1368579,
    longitude: 12.5924087
  },
  {
    latitude: 52.1367176,
    longitude: 12.591665
  },
  {
    latitude: 52.1369634,
    longitude: 12.5900056
  },
  {
    latitude: 52.1368754,
    longitude: 12.5886323
  },
  {
    latitude: 52.1370337,
    longitude: 12.5869157
  },
  {
    latitude: 52.1378766,
    longitude: 12.5879169
  },
  {
    latitude: 52.1386138,
    longitude: 12.5882031
  },
  {
    latitude: 52.1391759,
    longitude: 12.5880029
  },
  {
    latitude: 52.1397028,
    longitude: 12.5872304
  },
  {
    latitude: 52.1400623,
    longitude: 12.5867617
  },
  {
    latitude: 52.1403784,
    longitude: 12.586032
  },
  {
    latitude: 52.1405891,
    longitude: 12.5854742
  },
  {
    latitude: 52.1407866,
    longitude: 12.585088
  },
  {
    latitude: 52.1410237,
    longitude: 12.5848519
  },
  {
    latitude: 52.1412258,
    longitude: 12.584244
  },
  {
    latitude: 52.1415681,
    longitude: 12.5845873
  },
  {
    latitude: 52.1418927,
    longitude: 12.5846803
  },
  {
    latitude: 52.1423274,
    longitude: 12.5851309
  },
  {
    latitude: 52.1422614,
    longitude: 12.5860106
  },
  {
    latitude: 52.1421937,
    longitude: 12.586776
  },
  {
    latitude: 52.1422464,
    longitude: 12.5872158
  },
  {
    latitude: 52.1423141,
    longitude: 12.5876843
  },
  {
    latitude: 52.1422135,
    longitude: 12.5881385
  },
  {
    latitude: 52.1421674,
    longitude: 12.5885355
  },
  {
    latitude: 52.1433725,
    longitude: 12.589462
  },
  {
    latitude: 52.1435175,
    longitude: 12.5894763
  },
  {
    latitude: 52.1436203,
    longitude: 12.5896088
  },
  {
    latitude: 52.1437415,
    longitude: 12.5897569
  },
  {
    latitude: 52.1438574,
    longitude: 12.5898985
  },
  {
    latitude: 52.1438697,
    longitude: 12.5899001
  },
  {
    latitude: 52.144087,
    longitude: 12.5898304
  },
  {
    latitude: 52.144324,
    longitude: 12.5899806
  },
  {
    latitude: 52.1445643,
    longitude: 12.5901576
  },
  {
    latitude: 52.1446038,
    longitude: 12.5902274
  },
  {
    latitude: 52.1446236,
    longitude: 12.5903025
  },
  {
    latitude: 52.1446474,
    longitude: 12.590274
  },
  {
    latitude: 52.1451149,
    longitude: 12.5902097
  },
  {
    latitude: 52.1457626,
    longitude: 12.5900986
  },
  {
    latitude: 52.1469754,
    longitude: 12.5901303
  },
  {
    latitude: 52.1470709,
    longitude: 12.58939
  },
  {
    latitude: 52.1497038,
    longitude: 12.5877739
  },
  {
    latitude: 52.1515296,
    longitude: 12.5862289
  },
  {
    latitude: 52.1546893,
    longitude: 12.5820518
  },
  {
    latitude: 52.1568659,
    longitude: 12.5791336
  },
  {
    latitude: 52.157252,
    longitude: 12.5783325
  },
  {
    latitude: 52.1573572,
    longitude: 12.5770164
  },
  {
    latitude: 52.1581645,
    longitude: 12.5737548
  },
  {
    latitude: 52.1595337,
    longitude: 12.5693489
  },
  {
    latitude: 52.1623068,
    longitude: 12.5656868
  },
  {
    latitude: 52.163781,
    longitude: 12.5637984
  },
  {
    latitude: 52.1646233,
    longitude: 12.561853
  },
  {
    latitude: 52.1676768,
    longitude: 12.5589347
  },
  {
    latitude: 52.1702387,
    longitude: 12.5569893
  },
  {
    latitude: 52.1723092,
    longitude: 12.5554443
  },
  {
    latitude: 52.1732566,
    longitude: 12.5548721
  },
  {
    latitude: 52.1737129,
    longitude: 12.5535559
  },
  {
    latitude: 52.1743094,
    longitude: 12.5524116
  },
  {
    latitude: 52.1766605,
    longitude: 12.5509239
  },
  {
    latitude: 52.1794323,
    longitude: 12.5485206
  },
  {
    latitude: 52.1822745,
    longitude: 12.5435424
  },
  {
    latitude: 52.1842143,
    longitude: 12.5410061
  },
  {
    latitude: 52.186392,
    longitude: 12.5390009
  },
  {
    latitude: 52.1872956,
    longitude: 12.5383
  },
  {
    latitude: 52.1904704,
    longitude: 12.5359826
  },
  {
    latitude: 52.1910711,
    longitude: 12.5356106
  },
  {
    latitude: 52.1918953,
    longitude: 12.5350956
  },
  {
    latitude: 52.1928162,
    longitude: 12.5343661
  },
  {
    latitude: 52.1938159,
    longitude: 12.5336937
  },
  {
    latitude: 52.1940525,
    longitude: 12.5334792
  },
  {
    latitude: 52.1943157,
    longitude: 12.5335078
  },
  {
    latitude: 52.1944735,
    longitude: 12.5334504
  },
  {
    latitude: 52.1944823,
    longitude: 12.5322632
  },
  {
    latitude: 52.1944297,
    longitude: 12.5322774
  },
  {
    latitude: 52.1942716,
    longitude: 12.5319485
  },
  {
    latitude: 52.1941841,
    longitude: 12.5297312
  },
  {
    latitude: 52.1941841,
    longitude: 12.5293593
  },
  {
    latitude: 52.1940614,
    longitude: 12.5288013
  },
  {
    latitude: 52.1937545,
    longitude: 12.5282721
  },
  {
    latitude: 52.1931055,
    longitude: 12.527471
  },
  {
    latitude: 52.1928951,
    longitude: 12.5267558
  },
  {
    latitude: 52.192711,
    longitude: 12.5259976
  },
  {
    latitude: 52.1926496,
    longitude: 12.5252823
  },
  {
    latitude: 52.1926584,
    longitude: 12.52461
  },
  {
    latitude: 52.1930179,
    longitude: 12.5223784
  },
  {
    latitude: 52.1933073,
    longitude: 12.5209479
  },
  {
    latitude: 52.1939562,
    longitude: 12.5187591
  },
  {
    latitude: 52.1948769,
    longitude: 12.515984
  },
  {
    latitude: 52.1960164,
    longitude: 12.5143103
  },
  {
    latitude: 52.1964816,
    longitude: 12.513452
  },
  {
    latitude: 52.1968847,
    longitude: 12.5124649
  },
  {
    latitude: 52.1975162,
    longitude: 12.5109486
  },
  {
    latitude: 52.19827,
    longitude: 12.5095752
  },
  {
    latitude: 52.1992347,
    longitude: 12.5081305
  },
  {
    latitude: 52.19989,
    longitude: 12.5070777
  },
  {
    latitude: 52.2004072,
    longitude: 12.5059188
  },
  {
    latitude: 52.2005914,
    longitude: 12.5056042
  },
  {
    latitude: 52.2006966,
    longitude: 12.5050177
  },
  {
    latitude: 52.2007141,
    longitude: 12.5037732
  },
  {
    latitude: 52.2008106,
    longitude: 12.5027289
  },
  {
    latitude: 52.2013627,
    longitude: 12.5014271
  },
  {
    latitude: 52.2018276,
    longitude: 12.5002827
  },
  {
    latitude: 52.2021168,
    longitude: 12.4990811
  },
  {
    latitude: 52.2021257,
    longitude: 12.4981799
  },
  {
    latitude: 52.2024235,
    longitude: 12.4963631
  },
  {
    latitude: 52.2026605,
    longitude: 12.4947753
  },
  {
    latitude: 52.2028414,
    longitude: 12.4941367
  },
  {
    latitude: 52.2033762,
    longitude: 12.4929637
  },
  {
    latitude: 52.2039285,
    longitude: 12.4914474
  },
  {
    latitude: 52.2042179,
    longitude: 12.4903744
  },
  {
    latitude: 52.204402,
    longitude: 12.4890584
  },
  {
    latitude: 52.2046036,
    longitude: 12.4879426
  },
  {
    latitude: 52.2047962,
    longitude: 12.4866838
  },
  {
    latitude: 52.2048402,
    longitude: 12.4864834
  },
  {
    latitude: 52.2047877,
    longitude: 12.4860829
  },
  {
    latitude: 52.204814,
    longitude: 12.4854821
  },
  {
    latitude: 52.2047698,
    longitude: 12.485053
  },
  {
    latitude: 52.2048402,
    longitude: 12.484681
  },
  {
    latitude: 52.2049981,
    longitude: 12.484309
  },
  {
    latitude: 52.2051647,
    longitude: 12.4839658
  },
  {
    latitude: 52.2052697,
    longitude: 12.4837226
  },
  {
    latitude: 52.2051822,
    longitude: 12.4832505
  },
  {
    latitude: 52.2049806,
    longitude: 12.4826354
  },
  {
    latitude: 52.2049026,
    longitude: 12.4825786
  },
  {
    latitude: 52.2040959,
    longitude: 12.4820636
  },
  {
    latitude: 52.2034297,
    longitude: 12.4812053
  },
  {
    latitude: 52.2020621,
    longitude: 12.4804614
  },
  {
    latitude: 52.2006239,
    longitude: 12.4794887
  },
  {
    latitude: 52.1987302,
    longitude: 12.4770281
  },
  {
    latitude: 52.195679,
    longitude: 12.472565
  },
  {
    latitude: 52.1951526,
    longitude: 12.4719355
  },
  {
    latitude: 52.1929431,
    longitude: 12.4706194
  },
  {
    latitude: 52.1901018,
    longitude: 12.4687312
  },
  {
    latitude: 52.1886633,
    longitude: 12.4677585
  },
  {
    latitude: 52.1871552,
    longitude: 12.4646686
  },
  {
    latitude: 52.1860326,
    longitude: 12.4645541
  },
  {
    latitude: 52.1851555,
    longitude: 12.4640391
  },
  {
    latitude: 52.1843485,
    longitude: 12.4640391
  },
  {
    latitude: 52.1830856,
    longitude: 12.4629519
  },
  {
    latitude: 52.1826997,
    longitude: 12.4640963
  },
  {
    latitude: 52.1802086,
    longitude: 12.4671863
  },
  {
    latitude: 52.1756149,
    longitude: 12.4731371
  },
  {
    latitude: 52.1742466,
    longitude: 12.4750826
  },
  {
    latitude: 52.1720007,
    longitude: 12.4758265
  },
  {
    latitude: 52.1692985,
    longitude: 12.4767993
  },
  {
    latitude: 52.1685615,
    longitude: 12.4769137
  },
  {
    latitude: 52.1654729,
    longitude: 12.4778292
  },
  {
    latitude: 52.1643057,
    longitude: 12.4780438
  },
  {
    latitude: 52.1630423,
    longitude: 12.4782727
  },
  {
    latitude: 52.1628317,
    longitude: 12.4782727
  },
  {
    latitude: 52.1612873,
    longitude: 12.4786733
  },
  {
    latitude: 52.1599531,
    longitude: 12.4791309
  },
  {
    latitude: 52.1572855,
    longitude: 12.4809049
  },
  {
    latitude: 52.1563026,
    longitude: 12.4817059
  },
  {
    latitude: 52.1549684,
    longitude: 12.4809621
  },
  {
    latitude: 52.1539505,
    longitude: 12.4809049
  },
  {
    latitude: 52.1506852,
    longitude: 12.4813054
  },
  {
    latitude: 52.1409237,
    longitude: 12.4821065
  },
  {
    latitude: 52.1409062,
    longitude: 12.4860261
  },
  {
    latitude: 52.1416083,
    longitude: 12.4983857
  },
  {
    latitude: 52.1412311,
    longitude: 12.5023339
  },
  {
    latitude: 52.1410553,
    longitude: 12.5052521
  },
  {
    latitude: 52.141187,
    longitude: 12.5087998
  },
  {
    latitude: 52.1397561,
    longitude: 12.5159524
  },
  {
    latitude: 52.1399668,
    longitude: 12.5189278
  },
  {
    latitude: 52.1398264,
    longitude: 12.5189278
  },
  {
    latitude: 52.1392644,
    longitude: 12.5195572
  },
  {
    latitude: 52.1385621,
    longitude: 12.5193856
  },
  {
    latitude: 52.1375084,
    longitude: 12.5182984
  },
  {
    latitude: 52.1333291,
    longitude: 12.5180123
  },
  {
    latitude: 52.1326617,
    longitude: 12.5184129
  },
  {
    latitude: 52.131046,
    longitude: 12.5180694
  },
  {
    latitude: 52.129676,
    longitude: 12.5189278
  },
  {
    latitude: 52.1282357,
    longitude: 12.5191567
  },
  {
    latitude: 52.1252851,
    longitude: 12.5198434
  },
  {
    latitude: 52.1247932,
    longitude: 12.5202454
  },
  {
    latitude: 52.118153,
    longitude: 12.5228204
  },
  {
    latitude: 52.1177314,
    longitude: 12.5232209
  },
  {
    latitude: 52.1147797,
    longitude: 12.5264825
  },
  {
    latitude: 52.1116323,
    longitude: 12.5336109
  },
  {
    latitude: 52.1114915,
    longitude: 12.5348126
  },
  {
    latitude: 52.1118783,
    longitude: 12.5379597
  },
  {
    latitude: 52.1134242,
    longitude: 12.5411068
  },
  {
    latitude: 52.1153312,
    longitude: 12.5440251
  },
  {
    latitude: 52.1186339,
    longitude: 12.5493466
  },
  {
    latitude: 52.1196545,
    longitude: 12.5515808
  },
  {
    latitude: 52.1202518,
    longitude: 12.553698
  },
  {
    latitude: 52.1217623,
    longitude: 12.5565018
  },
  {
    latitude: 52.1231678,
    longitude: 12.5585045
  },
  {
    latitude: 52.1259431,
    longitude: 12.5611938
  },
  {
    latitude: 52.127405,
    longitude: 12.5622637
  },
  {
    latitude: 52.1282831,
    longitude: 12.5643236
  },
  {
    latitude: 52.130461,
    longitude: 12.5686151
  },
  {
    latitude: 52.132428,
    longitude: 12.5740511
  },
  {
    latitude: 52.1335871,
    longitude: 12.5754244
  },
  {
    latitude: 52.1351676,
    longitude: 12.578457
  },
  {
    latitude: 52.13587,
    longitude: 12.5805742
  },
  {
    latitude: 52.1360807,
    longitude: 12.5827486
  },
  {
    latitude: 52.1361861,
    longitude: 12.5837785
  },
  {
    latitude: 52.1367831,
    longitude: 12.5853235
  },
  {
    latitude: 52.1370641,
    longitude: 12.5869257
  }
];
