import React from "react";
import {
  View,
  Text,
  SectionList,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList
} from "react-native";
import BaseContainer from "./BaseContainer";
import Assets from "../assets";
import { EDColors } from "../assets/Colors";
import {
  RESPONSE_SUCCESS,
  ORDER_LISTING,
  funGetDateStr,
  INR_SIGN,
  capiString
} from "../utils/Constants";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { getUserToken } from "../utils/AsyncStorageHelper";
import { apiPost } from "../api/ServiceManager";
import ProgressLoader from "../components/ProgressLoader";
import { showValidationAlert, showDialogue } from "../utils/CMAlert";
import { Messages } from "../utils/Messages";
import { ETFonts } from "../assets/FontConstants";
import OrderStatusCard from "../components/OrderStatusCard";
import PriceDetail from "../components/PriceDetail";
import metrics from "../utils/metrics";
import { connect } from "react-redux";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import DataNotAvailableContainer from "../components/DataNotAvailableContainer";
import { netStatus } from "../utils/NetworkStatusConnection";
import { NavigationEvents } from "react-navigation";
import { Avatar, Badge, Icon, withBadge } from 'react-native-elements'


class MyOrderContainer extends React.Component {
  state = {
    isLoading: false,
    selectedIndex: 0,
    isEnable: false
  };

  arrayUpcoming = [];

  constructor(props) {
    super(props);
    var userObj = null;
  }
  updateData(arrayItems) {
    var arrayFinal = [];
    arrayItems.map((item, index) => {
      arrayFinal[index] = {
        title: "Order Details",
        data: [item],
        index: index,
        isShow: false
      };
    });

    this.arrayUpcoming = arrayFinal;
  }

  handleIndexChange = index => {
    this.setState({
      selectedIndex: index
    });
  };

  componentDidMount() {
    this.props.saveNavigationSelection("Order");
  }
  checkUser() {
    getUserToken(
      success => {
        userObj = success;

        this.loadData(success);
        this.getData(success);
      },
      failure => {
        showValidationAlert(Messages.loginValidation);
      }
    );
  }

  // stopTimer() {
  //   try {
  //     console.log ("timer clear")
  //     clearTimeout(this.state.clearId);
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  loadData(userObj) {
    // console.log ("load data called")
    // var clearId = setTimeout(() => {
    this.getData(userObj);
    // }, 60 * 1000);
    // this.setState({ clearId: clearId});
  }

  getData(userObj) {
    netStatus(status => {
      if (status) {
        this.setState({ isLoading: true });
        apiPost(
          ORDER_LISTING,
          {
            user_id: parseInt(userObj.UserID) || 0,
            token: "" + userObj.PhoneNumber
          },
          resp => {
            if (resp != undefined) {
              if (resp.status == RESPONSE_SUCCESS) {
               
                this.arrayUpcoming = resp.in_process.in_process;
              //  console.log("tttttttttttttt");
                this.updateData(this.arrayUpcoming);
                this.arrayPast = resp.past.past;
                this.setState({ isLoading: false });
              } else {
                showValidationAlert(resp.message);
                this.setState({ isLoading: false });
              }
            } else {
              showValidationAlert(Messages.generalWebServiceError);
              this.setState({ isLoading: false });
            }
          },
          err => {
            this.setState({ isLoading: false });
            showValidationAlert(Messages.internetConnnection);
          }
        );
      } else {
        showValidationAlert(Messages.internetConnnection);
      }
    });
  }

  itemHeader(orderData, index, isShow) {
   
    if (this.arrayUpcoming != undefined && this.arrayUpcoming.length > 0) {

      return (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              marginTop: 5,
              backgroundColor: EDColors.white,
              flexDirection: "row",
              padding: 5,
              borderRadius: 5
            }}
          >
            <Text
              style={{
                color: EDColors.primary,
                fontSize: 18,
                fontFamily: ETFonts.regular
              }}
            >
              {funGetDateStr(
                this.arrayUpcoming[index].data[0].order_date,
                "DD-MMM"
              )}
            </Text>
            <Text
              style={{
                flex: 1,
                color: EDColors.black,
                fontSize: 18,
                fontFamily: ETFonts.regular,
                marginLeft: 10
              }}
            >
              {console.log(
                "length",
                this.arrayUpcoming[index].data[0].items.length == 1
              )}
              {(this.arrayUpcoming[index].data[0].items != undefined &&
              this.arrayUpcoming[index].data[0].items.length > 0
                ? this.arrayUpcoming[index].data[0].items.length
                : 0) +
                (this.arrayUpcoming[index].data[0].items.length == 1
                  ? " Item Ordered"
                  : " Items Ordered")}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: ETFonts.regular
              }}
            >
              {" N$ " + this.arrayUpcoming[index].data[0].total}
            </Text>
            <Text />
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              style={{ marginTop: 5 }}
              data={
                this.arrayUpcoming[index].data[0].order_status != undefined &&
                this.arrayUpcoming[index].data[0].order_status.length > 0
                  ? this.getDataFromStatus(
                      this.arrayUpcoming[index].data[0].order_status,
                      this.arrayUpcoming[index].data[0].placed,
                      this.arrayUpcoming[index].data[0].confirmed,
                      this.arrayUpcoming[index].data[0].preparing,
                      this.arrayUpcoming[index].data[0].onGoing,
                      this.arrayUpcoming[index].data[0].delivered,
                      this.arrayUpcoming[index].data[0].paymentType
                    )
                  : []
              }
              horizontal={true}
              renderItem={({ item, index }) => {
                return !item.isLine ? (
                  <View style={{ flex:1}} >
                    <OrderStatusCard
                      image={item.image}
                      text={item.time}
                      heading={item.orderStatusText}
                      lines={0}
                    />
                  </View>
                ) : (
              
                  <View
                    style={{
                      backgroundColor: item.isComplete
                         ? EDColors.primary
                         : EDColors.black,
                       height: 0.5,
                       flex: 1,
                       width: (metrics.screenWidth - 20) / 9 - 18,
                       alignSelf: "flex-end",
                       marginBottom: 25
                    }}
                  />
                  
                );
              }}
              keyExtractor={(item, index) => item + index}
            />
          </View>
          <TouchableOpacity
            activeOpacity={1.0}
            style={styles.itemContainer}
            onPress={() => {
              if (isShow) {
                this.arrayUpcoming[index].isShow = false;
                this.setState({ isEnable: this.state.isEnable ? false : true });
              } else {
                this.arrayUpcoming[index].isShow = true;
                this.setState({ isEnable: this.state.isEnable ? false : true });
              }
            }}
          >
            <Text style={styles.itemTitle}>{orderData}</Text>
            <Image
              style={styles.rightImage}
              source={isShow ? Assets.ic_down_arrow : Assets.ic_up_arrow}
            />
          </TouchableOpacity>
        </View>
      );
    }
  }

  getDataFromStatus(
    status,
    pendingTime,
    placedTime,
    preparingTime,
    onGoingTime,
    deliveredTime,
    paymentType,
  ) {
    currentOrderStatus = [
      {
        image: Assets.orderplacedselected,
        isLine: false,
        isComplete: false,
        time: pendingTime,
        orderStatusText: "Placed"
      },
      {
        image: "",
        isLine: true,
        isComplete:status.trim() === "placed" ? false : true,
        time: "",
        orderStatusText: ""
      },
      {
        image:
          status.trim() === "placed"
            ? Assets.preparingdeselected
            : Assets.preparingselected,
        isLine: false,
        isComplete: false,
        time: placedTime,
        orderStatusText: "Confirmed"
      },
      {
        image: "",
        isLine: true,
        isComplete: status.trim() === "placed" || status.trim() === "confirmed" ? false : true,
        time: "",
        orderStatusText: ""
      },
      {
        image:
        status.trim() === "placed" || status.trim() === "confirmed" 
            ? Assets.preparingdeselected
            : Assets.preparingselected,
        isLine: false,
        isComplete: false,
        time: preparingTime,
        orderStatusText: "Preparing"
      },
      {
        image: "",
        isLine: true,
        isComplete:
        status.trim() === "placed" ||  status.trim() === "confirmed" || status.trim() === "preparing"
            ? false
            : true,
        time: "",
        orderStatusText: ""
      },
      {
        image:
        status.trim() === "placed" ||  status.trim() === "confirmed" || status.trim() === "preparing"
            ? Assets.onthewaydeselected
            : Assets.onthewayselected,
        isLine: false,
        isComplete: false,
        time: onGoingTime,
        orderStatusText: paymentType == "pickPoint"? "Ready Pickup":"On the way"
      },
      {
        image: "",
           isLine: true,
        isComplete: status.trim() === "delivered" ? true : false,
        time: "",
        orderStatusText: paymentType
      },
      {
        image:
         status.trim() === "delivered"
            ? Assets.deliveredselected
            : Assets.delivereddeselected,
        isLine: false,
        isComplete: false,
        time: deliveredTime,
        orderStatusText: "Delivered"
      }
    ];

    return currentOrderStatus;
  }

  nestedItem(data) {
     
    return (
      <View style={styles.nestedContainer}>
        <View style={{ flex: 1 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={data.items}
            listKey={(item, index) => "D" + index.toString()}
            renderItem={({ item, index }) => {
              return (
                <View style={{ flex: 1 }}>
                  <PriceDetail
                    title={capiString(item.name) + " (x" + item.quantity + ")"}
                    price={INR_SIGN + " " + item.itemTotal}
                  />
                </View>
              );
            }}
            keyExtractor={(item, index) => item + index}
          />

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginTop: 5
            }}
          >
            <View
              style={{
                backgroundColor: EDColors.black,
                height: 0.5,
                flex: 1,
                alignSelf: "center",
                marginLeft: 10,
                marginRight: 10
              }}
            />
          </View>
          <FlatList
            data={data.price}
            listKey={(item, index) => "Q" + index.toString()}
            renderItem={({ item, index }) => {
              return (
                <View style={{ flex: 1 }}>
                  <PriceDetail
                    title={capiString(item.label)}
                    price={
                      item.label.includes("total") ||
                      item.label.includes("Total") ||
                      item.label.includes("Discount")
                        ? INR_SIGN + " " + item.value
                        : item.value
                    }
                  />
                </View>
              );
            }}
            keyExtractor={(item, index) => item + index}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <BaseContainer
        title="Order"
        left="Menu"
        right={[]}
        onLeft={() => {
          this.props.navigation.openDrawer();
        }}
      >
        <NavigationEvents
          onWillFocus={payload => {}}
          onDidFocus={payload => {
            this.checkUser();
            console.log("did focus called");
          }}
          onWillBlur={payload => {}}
          onDidBlur={payload => {
            // this.stopTimer();
            console.log("will blur called");
          }}
        />
        {this.state.isLoading ? <ProgressLoader /> : null}
        <View style={{ flex: 1, margin: 10 }}>
          <SegmentedControlTab
            values={["In Process", "Past Orders"]}
            selectedIndex={this.state.selectedIndex}
            onTabPress={this.handleIndexChange}
            backgroundColor={EDColors.primary}
            tabStyle={styles.tabStyle}
            tabTextStyle={styles.tabTextStyle}
            activeTabStyle={styles.activeTabStyle}
            activeTabTextStyle={styles.activeTabTextStyle}
            allowFontScaling={false}
            borderColor={EDColors.primary}
          />
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{}}>
              {this.state.selectedIndex == 0 ? (
                <View style={{ flex: 1 }}>
                  {this.arrayUpcoming != undefined &&
                  this.arrayUpcoming != null &&
                  this.arrayUpcoming.length > 0 ? (
                    <SectionList
                      showsVerticalScrollIndicator={false}
                      extraData={this.state}
                      renderSectionHeader={({
                        section: { title, index, isShow }
                      }) => {
                        return title != "" ? (
                          this.itemHeader(title, index, isShow)
                        ) : (
                          <View />
                        );
                      }}
                      sections={this.arrayUpcoming}
                      renderItem={({ item, index, section }) => {
                        if (section.isShow) {
                          return this.nestedItem(item);
                        } else {
                          return null;
                        }
                      }}
                      keyExtractor={(item, index) => item + index}
                    />
                  ) : (
                   this.state.isLoading ? <View></View> : <DataNotAvailableContainer text={Messages.noOrderMsg} />
                  )}
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  {this.arrayPast != undefined &&
                  this.arrayPast != null &&
                  this.arrayPast.length > 0 ? (
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={this.arrayPast}
                      renderItem={({ item, index }) => {
                        return (
                          <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={() => {
                              this.props.navigation.navigate(
                                "OrderDetailContainer",
                                {
                                  OrderItem: item
                                }
                              );
                            }}
                          >
                            <View
                              style={{
                                flex: 1,
                                marginTop: 8,
                                backgroundColor: EDColors.white,
                                flexDirection: "row",
                                paddingLeft: 5,
                                paddingRight: 5,
                                paddingTop: 8,
                                paddingBottom: 8,
                                borderRadius: 5
                              }}
                            >
                              <Text
                                style={{
                                  color: EDColors.primary,
                                  fontSize: 18,
                                  fontFamily: ETFonts.regular
                                }}
                              >
                                {funGetDateStr(item.order_date, "DD-MMM")}
                              </Text>
                              <Text
                                style={{
                                  flex: 1,
                                  color: EDColors.black,
                                  fontSize: 18,
                                  fontFamily: ETFonts.regular,
                                  marginLeft: 10
                                }}
                              >
                                {(item.items != undefined &&
                                item.items.length > 0
                                  ? item.items.length
                                  : 0) + " Items Ordered"}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: ETFonts.regular
                                }}
                              >
                                {INR_SIGN+" "+ item.total}
                              </Text>
                              <Text />
                              <Badge
                                status="success"
                                value={item.order_status}
                                containerStyle={{ marginLeft:5,backgroundColor:EDColors.primary}}
                              />  
                            
                              </View>
                          </TouchableOpacity>
                        );
                      }}
                      keyExtractor={(item, index) => item + index}
                    />
                  ) : (
                    <DataNotAvailableContainer />
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </BaseContainer>
    );
  }
}

export default connect(
  state => {
    return {
      titleSelected: state.navigationReducer.selectedItem
    };
  },
  dispatch => {
    return {
      saveNavigationSelection: dataToSave => {
        dispatch(saveNavigationSelection(dataToSave));
      }
    };
  }
)(MyOrderContainer);

const styles = StyleSheet.create({
  itemContainer: {
    alignSelf: "flex-start",
    flexDirection: "row",
    margin: 5,
    padding: 4,
    borderRadius: 4,
    backgroundColor: EDColors.primary
  },
  itemTitle: {
    flex: 3,
    color: "#fff",
    padding: 10,
    fontFamily: ETFonts.regular,
    fontSize: 18
  },
  rightImage: {
    alignSelf: "center",
    marginEnd: 10
  },
  nestedContainer: {
    borderRadius: 6,
    backgroundColor: EDColors.white,
    marginLeft: 15,
    marginRight: 15,
    padding: 2,
    flex: 1
  },
  tabsContainerStyle: {
    //custom styles
    backgroundColor: EDColors.primary,
    alignSelf: "flex-start"
  },
  tabStyle: {
    //custom styles
    backgroundColor: EDColors.white,
    borderColor: EDColors.primary,
    alignSelf: "flex-start"
  },
  tabTextStyle: {
    //custom styles
    color: EDColors.primary,
    marginLeft: 5,
    marginRight: 5,
    alignSelf: "flex-start"
  },
  activeTabStyle: {
    //custom styles
    backgroundColor: EDColors.primary
  },
  activeTabTextStyle: {
    color: "#fff"
  },
  tabBadgeContainerStyle: {
    //custom styles
  },
  activeTabBadgeContainerStyle: {
    //custom styles
  },
  tabBadgeStyle: {
    //custom styles
  },
  activeTabBadgeStyle: {
    //custom styles
  }
});
