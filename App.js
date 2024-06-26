import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert, Image, ScrollView} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function HomeScreen() {
  return (
    <View style={styles.container}>
     <Image
        source={{ uri: 'https://i.ibb.co/whhPKm2/logo-recife-1-removebg-preview.png' }} // 
        style={styles.logo}
      />
      <Text style={styles.title}>Sobre nossos hospitais!</Text>
            <Text style={styles.text}>Atualmente nossa Rede de Saúde conveniada conta com 04 hospitais filantrópicos, o Hospital Santo Amaro, IMIP (Instituto Materno Infantil de Pernambuco); Casa de Saúde Maria Lucinda e Hospital Evangélico de Pernambuco com serviços de internamento, consultas em diversas especialidades médicas, exames de imagem e ainda cirurgias.Já a Rede própria possui 02 hospitais, o Hospital de Pediatria Helena Moura que dispõe de serviço de pronto atendimento pediátrico, consultas de especialidades médicas e não médicas como o ambulatório especializado de pneumologia com ênfase em asma e tuberculose infantil; e o Hospital da Mulher do Recife Dra. Mercês Pontes Cunha com atendimento para mães e bebês, além do Centro Sony Santos de Atenção à Mulher Vítima de Violência, o Ambulatório LBT (Lésbicas, mulheres bissexuais e mulheres transgenitalizadas) e consultas de especialidades médicas e não médicas, com oferta de exames de imagem e laboratoriais.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function MoreInfoScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
// API DA PREFEITURA COM INFORMAÇÕES DOS HOSPITAIS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://dados.recife.pe.gov.br/api/3/action/datastore_search', {
          params: {
            resource_id: 'a2dab4d4-3a7b-4cce-b3a7-dd7f5ef22226',
            limit: 100,
          },
        });

        setData(response.data.result.records);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

// DADOS DE NOME, ESPECIALIDADE E TELEFONE DOS HOSPITAIS
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Mais Informações</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            {data.map((item, index) => (
              <View key={index} style={styles.infoContainer}>
                <Text style={styles.infoLabel}>Nome:</Text> 
                <Text style={styles.infoText}>{item.nome_oficial}</Text>
                <Text style={styles.infoLabel}>Tipo de Serviço:</Text>
                <Text style={styles.infoText}>{item.tipo_servico}</Text>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoText}>{item.fone}</Text>
              </View>
            ))}
          </View>
        )}
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

function Mapa() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
//API DE DADOS SOBRE HOSPITAL, UTILIZANDO DADOS DE LATITUDE E LONGITUDE PARA DEFINIR NO MAPA EM RELAÇÃO AO USUÁRIO
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://dados.recife.pe.gov.br/api/3/action/datastore_search', {
          params: {
            resource_id: 'a2dab4d4-3a7b-4cce-b3a7-dd7f5ef22226',
            limit: 100, 
          },
        });

        const records = response.data.result.records.map(record => ({
          latitude: parseFloat(record.latitude),
          longitude: parseFloat(record.longitude),
          title: record.nome, 
        }));

        setMarkers(records);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        setLoading(false);
        Alert.alert('Erro', 'Ocorreu um erro ao carregar os dados da API.');
      }
    };

    fetchData();
  }, []);
// GEOLOCALIZAÇÃO
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão de localização não concedida',
          'Por favor, conceda permissão de localização para obter a localização.'
        );
        return;
      }

      try {
        let locationData = await Location.getCurrentPositionAsync({});
        setLocation(locationData);
        setRegion({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Erro ao obter a localização:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao obter a localização.');
      }
    };

    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.textBold}>HOSPITAIS PRÓXIMOS A VOCÊ.</Text>
      <StatusBar style="auto" />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={{ flex: 1, width: '100%' }}>
          <MapView
            style={styles.map}
            region={region || {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.title}
              />
            ))}
            {location && (
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Sua Localização"
                pinColor="blue"
              />
            )}
          </MapView>
        </View>
      )}
    </View>
  );
}

const Tab = createBottomTabNavigator();
//NAVEGAÇÃO DO APLICATIVO
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Página Inicial') {
              iconName = 'hospital-box-outline';
            } else if (route.name === 'Mais informações') {
              iconName = 'information-outline';
            } else if (route.name === 'Mapa') {
              iconName = 'map-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#000080',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Página Inicial" component={HomeScreen} />
        <Tab.Screen name="Mapa" component={Mapa} />
        <Tab.Screen name="Mais informações" component={MoreInfoScreen} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    padding: 20,
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    padding: 20,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 50,
  },
  text: {
    textAlign: 'justify',
    padding: 10,
  },
  textBold: {
    textAlign: 'center',
    padding: 10,
    fontWeight: 'bold',
    marginBottom: 0,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    backgroundColor: '#cac5c5',
    borderColor: '#dac1c1',
    borderRadius: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginTop: 1.5,
  },
  infoText: {
    fontSize: 16,
  },
});
