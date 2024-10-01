import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SandBox = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.boxOne}>boxOne</Text>
      <Text style={styles.boxTwo}>boxTwo</Text>
      <Text style={styles.boxThree}>boxThree</Text>
      <Text style={styles.boxFour}>boxFour</Text>
      <Text style={styles.boxFive}>boxFive</Text>
    </View>
  )
}

export default SandBox

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#dedede',
    height: 200,
  },
  boxOne: {
    flex: 1,
    backgroundColor: 'violet',
    padding: 20,
  },
  boxTwo: {
    flex: 0.5,
    backgroundColor: 'red',
    padding: 10,
  },
  boxThree: {
    flex: 2.5,
    backgroundColor: 'coral',
    padding: 50,
  },
  boxFour: {
    backgroundColor: 'pink',
    padding: 30,
    flex: 2,
  },
  boxFive: {
    backgroundColor: 'green',
    padding: 40,
    flex: 1.5,
  }
})