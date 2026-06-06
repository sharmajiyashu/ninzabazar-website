import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Order } from '@/app/types/type'
const styles = StyleSheet.create({
  page: {
    padding: 6,
    fontSize: 8,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionBox: {
    border: '1px solid #000',
    padding: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 8,
  },
  value: {
    fontSize: 8,
  },
  trackingBox: {
    border: '1px solid #000',
    height: 20,
    marginBottom: 4,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  trackingLabel: {
    fontSize: 8,
  },
  trackingNote: {
    color: '#000',
    fontSize: 6,
    fontStyle: 'italic',
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    fontSize: 7,
    marginTop: 2,
  },
  deliveryAttemptBox: {
    border: '1px solid #000',
    padding: 1,
    width: 10,
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 6,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
})

export const WaybillPDF = ({
  order,
  sellerName,
  sellerAddress,
  buyerAddress,
}: {
  order: Order
  sellerName: string
  sellerAddress: string
  buyerAddress: string
}) => {
  const trackingId = order.id.slice(-12).toUpperCase()

  return (
    <Document>
      <Page size={{ width: 226.8, height: 283.5 }} style={styles.page}>
        <Text style={styles.header}>Ninja Bazaar</Text>
        <View style={styles.trackingBox}>
          <Text style={styles.trackingLabel}>Tracking Number:</Text>
          <Text style={styles.trackingNote}>Write tracking number here</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Waybill #</Text>
          <Text style={styles.value}>{trackingId}</Text>

          <Text style={styles.label}>Order Date</Text>
          <Text style={styles.value}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Buyer</Text>
          <Text style={styles.value}>
            {order.buyer.user.firstName} {order.buyer.user.lastName}
          </Text>
          <Text style={styles.value}>{order.buyer.user.contactNumber}</Text>
          <Text style={styles.value}>{buyerAddress}</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Seller</Text>
          <Text style={styles.value}>{sellerName}</Text>
          <Text style={styles.value}>{sellerAddress}</Text>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.label}>Product Quantity:</Text>
          <Text style={styles.value}>
            {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
          </Text>
        </View>

        <View style={styles.deliveryRow}>
          <Text>Delivery Attempt</Text>
          {[1, 2, 3].map((num) => (
            <Text key={num} style={styles.deliveryAttemptBox}>
              {num}
            </Text>
          ))}
        </View>

        <View style={styles.deliveryRow}>
          <Text>Return Attempt</Text>
          {[1, 2, 3].map((num) => (
            <Text key={num} style={styles.deliveryAttemptBox}>
              {num}
            </Text>
          ))}
        </View>

        <Text style={styles.footerNote}>Handle with care. Thank you!</Text>
      </Page>
    </Document>
  )
}
