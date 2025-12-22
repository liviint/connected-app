import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ResetPassword from '../../../src/components/ResetPassword/ResetPasswordConfirm';
import PageLoader from '../../../src/components/common/PageLoader';

const ResetPasswordScreen = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500); 
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PageLoader message={"Loading..."} />

  return (
    <View style={styles.container}>
      <ResetPassword />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResetPasswordScreen;
