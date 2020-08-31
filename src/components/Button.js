import React from 'react';
import PropTypes from 'prop-types';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';

export default Button = React.memo((props) => {
  return (
    <TouchableOpacity style={styles.button} onPress={props.onPressButton}>
      <Text style={styles.buttonText} children={props.buttonText} />
    </TouchableOpacity>
  );
});

Button.propTypes = {
  onPressButton: PropTypes.func,
  buttonText: PropTypes.string,
};

Button.defaultProps = {
  buttonText: 'Button Text',
};

const styles = StyleSheet.create({
  button: {
    width: '80%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
