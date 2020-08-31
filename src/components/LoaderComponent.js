import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';

export default Loader = React.memo((props) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={'white'} size={'large'} />
      <Text style={styles.textStyling} children={props.loadingText} />
    </View>
  );
});

Loader.propTypes = {
  loadingText: PropTypes.string,
};

Loader.defaultProps = {
  loadingText: 'Please wait ..!',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyling: {
    textAlign: 'center',
    fontSize: 25,
    color: 'white',
    marginLeft: 10,
  },
});
