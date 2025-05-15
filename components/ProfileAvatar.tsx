import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { View, Alert, Image, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';

interface Props {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

export default function ProfileAvatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message);
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [3, 3],
        quality: 0.5,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];
      console.log('Got image', image);

      if (!image.uri) {
        throw new Error('No image uri!');
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(data.path);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <View className="items-center">
      {avatarUrl ? (
        <Avatar style={avatarSize}>
          <AvatarFallbackText>Dimitri Hartt</AvatarFallbackText>
          <AvatarImage
            source={{ uri: avatarUrl }}
            style={avatarSize}
          />
          <AvatarBadge 
            style={{
                position: 'absolute',
                bottom: 6,
                right: 16,
                width: size / 6,
                height: size / 6,
                borderRadius: size / 8,
                backgroundColor: '#22c55e', // green-500
                borderWidth: 2,
                borderColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
              }} />
        </Avatar>
      ) : (
        <View
          style={avatarSize}
          className="max-w-full overflow-hidden rounded-md border border-gray-300 bg-neutral-800"
        />
      )}

      <View className="mt-4 w-32">
        <Button
          title={uploading ? 'Uploading ...' : 'Upload'}
          onPress={uploadAvatar}
          disabled={uploading}
        />
      </View>
    </View>
  );
}
