import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import LoadingSkeleton from './LoadingSkeleton';

export default function HomeSkeleton() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <LoadingSkeleton width="100%" height={56} borderRadius={12} />
      </View>

      {/* Popular Products Section */}
      <LoadingSkeleton width="60%" height={24} style={styles.sectionTitle} />
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {[1, 2, 3].map((_, index) => (
          <View key={index} style={styles.productCard}>
            <LoadingSkeleton width={240} height={240} borderRadius={12} />
            <LoadingSkeleton width="80%" height={20} style={styles.productTitle} />
            <LoadingSkeleton width="60%" height={16} />
          </View>
        ))}
      </ScrollView>

      {/* Coupons Section */}
      <LoadingSkeleton width="70%" height={24} style={styles.sectionTitle} />
      
      <View style={styles.couponCard}>
        <View style={styles.couponContent}>
          <LoadingSkeleton width="40%" height={16} style={styles.couponLabel} />
          <LoadingSkeleton width="80%" height={20} style={styles.couponTitle} />
          <LoadingSkeleton width="60%" height={16} style={styles.couponDescription} />
          <LoadingSkeleton width={100} height={32} borderRadius={16} style={styles.couponButton} />
        </View>
        <LoadingSkeleton width={120} height={80} borderRadius={12} />
      </View>

      {/* Recent Orders Section */}
      <LoadingSkeleton width="50%" height={24} style={styles.sectionTitle} />
      
      <View style={styles.orderItem}>
        <LoadingSkeleton width={56} height={56} borderRadius={8} />
        <View style={styles.orderDetails}>
          <LoadingSkeleton width="70%" height={20} />
          <LoadingSkeleton width="50%" height={16} style={styles.orderSubtext} />
        </View>
        <LoadingSkeleton width={60} height={20} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    padding: 16,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  productCard: {
    width: 240,
    marginRight: 12,
  },
  productTitle: {
    marginTop: 16,
    marginBottom: 4,
  },
  couponCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 16,
  },
  couponContent: {
    flex: 1,
  },
  couponLabel: {
    marginBottom: 8,
  },
  couponTitle: {
    marginBottom: 8,
  },
  couponDescription: {
    marginBottom: 16,
  },
  couponButton: {
    alignSelf: 'flex-start',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  orderDetails: {
    flex: 1,
  },
  orderSubtext: {
    marginTop: 4,
  },
});