import React from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList
} from "react-native";
import Geocoder from "react-native-geocoding";
import {
  GOOGLE_API_KEY,
  REGISTRATION_HOME,
  RESPONSE_SUCCESS,
  SEARCH_PLACEHOLDER,
  
} from "../utils/Constants";
import Assets from "../assets";
import BaseContainer from "./BaseContainer";
import HomeCategoryCard from "../components/HomeCategoryCard";
import PopularRestaurantCard from "../components/PopularRestaurantCard";
// import RestaurantOverview from "../components/RestaurantOverview";
import { apiPost } from "../api/ServiceManager";
// import { apiPostFormData } from "../api/APIManager";
// import { apiPosts } from "../api/APIManager";
import { EDColors } from "../assets/Colors";
import ETextViewNormalLable from "../components/ETextViewNormalLable";
import { getUserToken, getCartList } from "../utils/AsyncStorageHelper";
import { showValidationAlert, showDialogue } from "../utils/CMAlert";
import { connect } from "react-redux";
import { saveNavigationSelection } from "../redux/actions/Navigation";
import BannerImages from "../components/BannerImages";
import DataNotAvailableContainer from "../components/DataNotAvailableContainer";
import { netStatus } from "../utils/NetworkStatusConnection";
import { Messages } from "../utils/Messages";
import { ETFonts } from "../assets/FontConstants";
import Geolocation from "@react-native-community/geolocation";

class MainContainer extends React.Component {
  constructor(props) {
    super(props);

    //(this.menuArray = []),
    headerPhoneNum = "";
    strSearch = "";
    this.foodType = "";
    this.distance = "";
    this.modelSelected = "";
    // this.count = 0;
    //(this.menu_item = [])
    //this.restuarant_id="";
  }



  state = {
   // isLoading: false,
    latitude: 0.0,
    longitude: 0.0,
    //restaurant_id: "15",
    //refresh: this.props.navigation.state.params.refresh,
    error: null,
    isLoading: false,
    strAddress: null,
   // menu=[],
    isNetConnected: true,
    count: 0
  };

  async componentDidMount() {
    getUserToken(
      success => {
        headerPhoneNum = success.PhoneNumber;
      },
      failure => { }
    );
    netStatus(status => {
      if (status) {
        Geocoder.init(GOOGLE_API_KEY);
        this.setState({ isLoading: true });
        Geolocation.getCurrentPosition(
          position => {
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null
            });

            this.loadData(
              position.coords.latitude,
              position.coords.longitude,
              ""
            );
          },
          error => {
            this.setState({ isLoading: false });
            this.setState({ error: error.message });
          },
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
        );
      } else {
        showValidationAlert(Messages.internetConnnection);
      }
    });
  }


  loadData(lat, long, searchText) {
    netStatus(status => {
      if (status) {
        this.setState({ isLoading: true });
        apiPost(
          REGISTRATION_HOME,
          {
            latitude: lat,
            longitude: long,
            itemSearch: searchText,
            token: headerPhoneNum,
            food: "" + this.foodType,
            distance: "" + this.distance
          },
          resp => {
            if (resp != undefined) {
              if (resp.status == RESPONSE_SUCCESS) {
                this.arrayRestaurants = resp.restaurant;
                this.arrayCategories = resp.category;
                this.arraySlider = resp.slider;
                //this.getMenuDetails() 
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
            showValidationAlert(err.message || Messages.generalWebServiceError);
          }
        );
      } else {
        showValidationAlert(Messages.internetConnnection);
      }
    });
  }


  testFunction = data => {
    this.foodType = data.food;
    this.distance = data.distance;

    this.loadData(this.state.latitude, this.state.longitude, "");
  };

  refreshScreen = () => {
    this.loadData(this.state.latitude, this.state.longitude, "");
  };

  rightClick = index => {
    if (this.state.count > 0) {
      if (index == 0) {
        this.props.navigation.navigate("CartContainer");
      } else if (index == 1) {
        this.props.navigation.navigate("Filter", {
          getFilterDetails: this.testFunction,
          filterType: "Main",
          food: this.foodType,
          distance: this.distance
        });
      }
    } else {
      if (index == 0) {
        this.props.navigation.navigate("Filter", {
          getFilterDetails: this.testFunction,
          filterType: "Main",
          food: this.foodType,
          distance: this.distance
        });
      }
    }
  };



  render() {
    this.props.navigation.addListener("didFocus", payload => {
      getCartList(
        success => {
          console.log("success", success);
          if (success != undefined) {
            console.log("success if", success);
            cartData = success.items;
            if (cartData.length > 0) {
              this.count = 0;
              cartData.map((item, index) => {
                console.log("count", this.count);
                this.count = this.count + item.quantity;
                console.log("count---->>>", this.count);
              });

              console.log("count final", this.count);
              this.setState({ count: this.count });
              //this.props.saveCartCount(count);
            } else if (cartData.length == 0) {
              //this.props.saveCartCount(0);
              this.setState({ count: 0 });
            }
          } else {
          }
        },
        onCartNotFound => { },
        error => { }
      );
      this.props.saveNavigationSelection("Home");
    });

    return (
      <BaseContainer
        title="Home"
        left="Menu"
        //right={[{ url: Assets.ic_filter }]}
        right={
          this.state.count > 0
            ? [
              {
                url: Assets.ic_cart,
                name: "Cart",
                value: this.state.count
              },
              { url: Assets.ic_filter, name: "filter" }
            ]
            : [{ url: Assets.ic_filter }]
        }
        onLeft={() => {
          this.props.navigation.openDrawer();
        }}
        onRight={this.rightClick}
        loading={this.state.isLoading}
      >
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                {console.log("image array", this.arraySlider)}
                {this.arraySlider != undefined ? (
                  <BannerImages images={this.arraySlider} />
                ) : (
                    <Image
                      source={Assets.dhaba_placeholder}
                      style={{
                        alignItems: "center",
                        width: "100%",
                        height: 180
                      }}
                    />
                  )}

                <View
                  style={{
                    backgroundColor: "white",
                    marginLeft: 15,
                    marginRight: 15,
                    borderRadius: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    position: "absolute",
                    marginTop: 155
                  }}
                >
                  <View
                    style={{
                      paddingLeft: 5,
                      paddingRight: 5,
                      backgroundColor: EDColors.primary,
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottomStartRadius: 5,
                      borderTopStartRadius: 5
                    }}
                  >
                    <Image source={Assets.ic_location} style={{ margin: 10 }} />
                  </View>

                  <View
                    style={{ flexDirection: "row", paddingLeft: 5, flex: 1 }}
                  >
                    <TextInput
                      style={{ fontFamily: ETFonts.regular, fontSize: 12 }}
                      numberOfLines={1}
                      placeholder={SEARCH_PLACEHOLDER}
                      style={{
                        flex: 5
                      }}
                      onChangeText={newText => {
                        this.strSearch = newText;
                      }}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={{
                        paddingRight: 8
                      }}
                      onPress={() => {
                        this.loadData(
                          this.state.latitude,
                          this.state.longitude,
                          this.strSearch
                        );
                        this.modelSelected = "";
                      }}
                    >
                      <Image
                        source={Assets.ic_search}
                        resizeMode="contain"
                        style={{
                          flex: 1,
                          width: 20,
                          height: 20,
                          alignSelf: "center"
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <FlatList
              style={{ marginTop: 30, marginStart: 10, marginEnd: 10 }}
              horizontal
              extraData={this.state}
              data={this.arrayCategories}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item + index}
              renderItem={(item, index) => {
                return (
                  <HomeCategoryCard
                    
                    categoryObjModel={item}
                    onPress={model=> {
                     //this.getMenuDetails();

                       this.loadData(
                        this.state.latitude,
                        this.state.longitude,
                        item.item.name
                      );

                      // this.props.navigation.navigate("CategoryContainer", {
                        
                      //       resName: categoryObjModel.name,
                      //       resid: categoryObjModel.restuarant_id,
                      //       menuItem: categoryObjModel.menu_item,
                      //       image: categoryObjModel.image 

                      // });
                    
                     this.modelSelected = item.item.name;
                    }}
                    isSelected={
                      this.modelSelected == item.item.name ? true : false
                    }
                  />
                );
              }}
            />

            {this.arrayRestaurants != undefined &&
              this.arrayRestaurants != null &&
              this.arrayRestaurants.length > 0 ? (
                <View>
                  <ETextViewNormalLable text="Restaurant" />
                  <FlatList
                    style={{ margin: 5 }}
                    data={this.arrayRestaurants}
                    extraData={this.state}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => item + index}
                    renderItem={(item, index) => {
                      return (
                        <PopularRestaurantCard
                          restObjModel={item}
                          onPress={restObjModel => {
                            this.props.navigation.navigate(
                              "RestaurantContainer",
                              {
                                refresh: this.refreshScreen,
                                restId: restObjModel.restuarant_id
                              }
                            );
                          }}
                        />
                      );
                    }}
                  />
                </View>
              ) : this.arrayRestaurants != undefined &&
                this.arrayRestaurants != null &&
                this.arrayRestaurants.length == 0 ? (
                  <DataNotAvailableContainer />
                ) : (
 <View style = {{flex:1}}>
                    {this.state.isLoading ? null :
                  <TouchableOpacity style = {{alignSelf:'center',backgroundColor:EDColors.primary,padding:10, marginVertical:100}} 
                  
                  onPress = {()=> this.loadData(this.state.latitude, this.state.longitude, this.refreshScreen)}>
                    {/* <Image
                    source = {Assets.refresh}/> */}
                    <Text style = {{color:EDColors.white}}>
                      Reload
                    </Text>
                  </TouchableOpacity>
                  }
                  </View >
                )}
          </ScrollView>
        </View>
      </BaseContainer>
    );
  }
}

export default connect(
  state => {
    return {
      userIdFromRedux: state.userOperations.userIdInRedux
    };
  },
  dispatch => {
    return {
      saveNavigationSelection: dataToSave => {
        dispatch(saveNavigationSelection(dataToSave));
      }
    };
  }
)(MainContainer);
