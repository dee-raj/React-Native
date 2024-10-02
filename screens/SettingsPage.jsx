import { Pressable, Text, View } from 'react-native'
import React from 'react'
import { globalstyles } from '../style/GlobalStyle'

const SettingsPage = ({ navigation }) => {
  return (
    <View style={[globalstyles.container, { backgroundColor: '#67F349' }]}>
      <Text style={globalstyles.textStyle}>SettingsPage</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable onPress={() => navigation.goBack()} style={globalstyles.Btn}>
          <Text style={globalstyles.textStyle}>Go back home</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default SettingsPage
