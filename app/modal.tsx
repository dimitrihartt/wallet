import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.7; // 70% of screen width
const BRACKET_SIZE = 30;
const BRACKET_THICKNESS = 4;

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setScannedData(data); // Store the scanned data
    console.log(`Scanned type: ${type}, data: ${data}`);
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      {scanned ? (
        <View style={styles.scannedContainer}>
          <Text style={styles.scannedTitle}>Scanned Data:</Text>
          <Text style={styles.scannedData}>{scannedData}</Text>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)} // Reset scanning
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView
          style={styles.cameraView}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}>
          {/* QR Code Aiming Brackets */}          
          <View style={styles.overlay}>
            <View style={styles.frame}>
              {/* Top Left */}
              <View style={[styles.corner, styles.topLeft]} />
              {/* Top Right */}
              <View style={[styles.corner, styles.topRight]} />
              {/* Bottom Left */}
              <View style={[styles.corner, styles.bottomLeft]} />
              {/* Bottom Right */}
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Flip Camera Button */}
          <View style={styles.flipButtonContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipButtonText}>Flip Camera</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full screen
    backgroundColor: 'black', // Add a background color for better visibility
    marginBottom: 80,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
  },
  scannedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  scannedTitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 16,
  },
  scannedData: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  scanAgainButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 50,
  },
  scanAgainText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  cameraView: {
    flex: 1, // Ensure the camera view takes up the full available space
    width: '100%', // Make sure it spans the full width of the screen
    height: '100%', // Make sure it spans the full height of the screen
  },
  flipButtonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flipButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 50,
  },
  flipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    position: 'absolute',
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
  },
});
