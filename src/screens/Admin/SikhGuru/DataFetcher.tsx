import React, { useEffect } from 'react';
import database from '@react-native-firebase/database';
 
export type GuruType = {
  id: string;
  title: string;
  history: string;
  imageUrl?: string;
  pdfUrl?: string;
};
 
type Props = {
  onDataChange: (data: GuruType[]) => void;
};
 
export default function DataFetcher({ onDataChange }: Props) {
  useEffect(() => {
    const ref = database().ref('SikhGurus');
 
    const listener = ref.on('value', snapshot => {
      const data = snapshot.val() || {};
      const list: GuruType[] = Object.keys(data).map(key => ({
        id: key,
        title: data[key].title,
        history: data[key].history,
        imageUrl: data[key].imageUrl || '',
        pdfUrl: data[key].pdfUrl || '',
      }));
      onDataChange(list);
    });
 
    return () => ref.off('value', listener);
  }, []);
 
  return null;
}
 
 