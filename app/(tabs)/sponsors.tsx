import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions, useColorScheme } from 'react-native';
import texts from '../../constants/texts';

export default function SponsorsScreen() {
  const [imgHeight, setImgHeight] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  const colorScheme = useColorScheme();

  const getSponsorsImage = () => texts.sponsorsImage;

  useEffect(() => {
    Image.getSize(getSponsorsImage(), (width, height) => {
      const screenWidth = Dimensions.get('window').width;
      const scaleFactor = width / screenWidth;
      const imageHeight = height / scaleFactor;
      setImgWidth(screenWidth);
      setImgHeight(imageHeight);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.infoImageContainer}>
        <Image
          source={{ uri: getSponsorsImage() }}
          style={{ width: imgWidth, height: imgHeight }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b0b1b3',
  },
  infoImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
