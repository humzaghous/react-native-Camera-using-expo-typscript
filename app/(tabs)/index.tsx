import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import SplashScreen from 'react-native-splash-screen';
import { useNavigation } from '@react-navigation/native';
import { RouteProp, ParamListBase } from '@react-navigation/native';

type CameraScreenRouteProp = RouteProp<ParamListBase, 'CameraScreen'>;

interface Props {
  route: CameraScreenRouteProp;
}

const CameraScreen: React.FC<Props> = ({ route }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');

      SplashScreen.hide();
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImageUri(photo.uri);

      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      fetch('http://127.0.0.1:8000/api/predict_emotions/', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          navigation.navigate('Emotion', { emotions: data.emotions });
        })
        .catch(error => console.error('Error:', error));
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled) {
        setImageUri(result.uri);

        const formData = new FormData();
        formData.append('image', {
          uri: result.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });

        fetch('http://127.0.0.1:8000/api/predict_emotions/', {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            navigation.navigate('Emotion', { emotions: data.emotions });
          })
          .catch(error => console.error('Error:', error));
      }
    } else {
      alert('Permission to access the media library is required!');
    }
  };

  const goBack = () => {
    setImageUri(null);
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <MaterialIcons name="keyboard-backspace" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() =>
              setCameraType(prevType =>
                prevType === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
              )
            }
          >
            <MaterialIcons name="flip-camera-ios" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
            <MaterialIcons name="photo-library" size={32} color="#fff" />
          </TouchableOpacity>
        </Camera>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3C4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3C4E',
  },
  galleryButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3C4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
});

export default CameraScreen;
