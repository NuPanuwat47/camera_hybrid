import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  Image,
  Dimensions 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, setMediaPermission] = useState(null);
  const [cameraType, setCameraType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [photo, setPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(mediaStatus === 'granted');
    })();
  }, []);

  // ขอสิทธิ์กล้องหากยังไม่ได้รับอนุญาต
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>กำลังโหลด...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>แอพต้องการสิทธิ์เข้าถึงกล้อง</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>อนุญาตการเข้าถึงกล้อง</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          skipProcessing: false,
        });
        setPhoto(photo);
        setShowCamera(false);
      } catch (error) {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถถ่ายรูปได้');
      }
    }
  };

  const savePhoto = async () => {
    if (photo) {
      try {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        Alert.alert('สำเร็จ', 'บันทึกรูปภาพลงอัลบั้มแล้ว');
      } catch (error) {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกรูปภาพได้');
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    setShowCamera(true);
  };

  const switchCamera = () => {
    setCameraType(
      cameraType === 'back' ? 'front' : 'back'
    );
  };

  const toggleFlash = () => {
    if (flashMode === 'off') {
      setFlashMode('on');
    } else if (flashMode === 'on') {
      setFlashMode('auto');
    } else {
      setFlashMode('off');
    }
  };

  // ฟังก์ชันสำหรับแสดงไอคอนแฟลช
  const getFlashIcon = () => {
    switch (flashMode) {
      case 'off':
        return '⚡️ปิด'; // แฟลชปิด
      case 'on':
        return '⚡️เปิด'; // แฟลชเปิด
      case 'auto':
        return '⚡️ออโต้'; // แฟลช Auto
      default:
        return '⚡️ปิด';
    }
  };

  if (!showCamera && photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo.uri }} style={styles.previewImage} />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={retakePhoto}>
            <Text style={styles.buttonText}>ถ่ายรูปใหม่</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
            <Text style={styles.buttonText}>บันทึก</Text>
          </TouchableOpacity>
        </View>
        
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
        ref={cameraRef}
        animateShutter={false}
        enableTorch={flashMode === 'on'}
      >
        <View style={styles.cameraContainer}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Text style={styles.flashButtonText}>
                {getFlashIcon()}
              </Text>
              <Text style={styles.flashModeText}>
                {flashMode.toUpperCase()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
              <Text style={styles.controlButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
      
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 24,
    color: 'white',
  },
  flashButtonText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 2,
  },
  flashModeText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  captureButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  previewImage: {
    flex: 1,
    width: width,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 10,
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
});
