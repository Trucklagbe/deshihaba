import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { ETFonts } from "../assets/FontConstants";
import Assets from "../assets";
import { EDColors } from "../assets/Colors";
import metrics from "../utils/metrics";

export default class OrderStatusCard extends React.PureComponent {
  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          width: ((metrics.screenWidth - 20) / 9) + 15,
        }}
      >
        <Text
          style={{
            fontSize: 8,
            fontFamily: ETFonts.regular,
            color: EDColors.primary
          }}
          numberOfLines={this.props.lines}
        >
          {this.props.text}
        </Text>
        <Text
          style={{
            fontSize: 8,
            fontFamily: ETFonts.regular,
          }}
        >
          {this.props.heading}
        </Text>
        <Image style={{ width: ((metrics.screenWidth - 20) / 9) + 12, height: ((metrics.screenWidth - 20) / 9) + 12, marginTop: 5 }} source={this.props.image} />
      </View>
    );
  }
}
