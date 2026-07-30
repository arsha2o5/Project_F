import React, {useEffect, useState} from "react";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import {router, Stack} from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Slider from '@react-native-community/slider';
import {
  Image,
  Keyboard,
  ImageBackground,
  StyleSheet,
  Text,
  DeviceEventEmitter,
  TextInput,
  View,
  Dimensions,
  Pressable,
  Alert,
  Modal
} from "react-native";
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing
} from "react-native-reanimated";
import { applyDecay, defaultPetStats, loadServerWellness } from "@/lib/petstats";
import { loadPetStats, savePetStats } from "@/lib/petstorage";
import {
  activityEnergyLossPerHour,
  activityOptions,
  careActionLabels,
  challenges,
  MAINTENANCE_CALORIES,
  DAILY_WATER_GOAL_ML,
  TASK_MENU_CLOSED_X,
  TASK_MENU_WIDTH,
  TASK_MENU_PEEK,
  WATER_SERVING_ML,
  tabs,
  clamp,
} from "./constants";
import type { ActiveTab, ActivityType, CareAction } from "./constants";
import {styles} from "./habitat-styles";
import { PetInfoPanel } from "./components/pet-info-panel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { analyzeMeal } from "./utils/aiService";
import { Button } from "@react-navigation/elements";


const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function HabitatScreen() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [availableCareActions, setAvailableCareActions] = useState<CareAction[]>([]);
  const [calorieInput, setCalorieInput] = useState("");
  const [mealInput, setMealInput] = useState("");
  const [calorieIntake, setCalorieIntake] = useState(0);
  const [hoursRestedInput, setHoursRestedInput] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>("Walking");
  const [activityMenuOpen, setActivityMenuOpen] = useState(false);
  const [activityMinutesInput, setActivityMinutesInput] = useState("");
  const taskMenuX = useSharedValue(TASK_MENU_CLOSED_X);
  const profileMenuProgress = useSharedValue(0);
  const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const [petStats, setPetStats] = useState(defaultPetStats);
  const foodPercent = petStats.hunger;
  const energyPercent = petStats.energy;
  const waterPercent = clamp((petStats.hydration / DAILY_WATER_GOAL_ML) * 100, 0, 100);
  const [waterButtonWidth, setWaterButtonWidth] = useState(0);
  const waterFillWidth = useSharedValue(0);
  const [petImages, setPetImages] = useState<any>(null);
  const [petState, setPetState] = useState("neutral");
  const [petLayout, setPetLayout] = useState({
  neutral: { x: 0, y: 0, scale: 1 },
  happy: { x: 0, y: 0, scale: 1 },
  sad: { x: 0, y: 0, scale: 1 },
});
  const [editingState, setEditingState] = useState<null | "neutral" | "happy" | "sad">(null);
  const [showStatePicker, setShowStatePicker] = useState(false);
  
  const foodState =
    petStats.hunger < 25
      ? "Low"
      : petStats.hunger < 35
        ? "Rising"
        : petStats.hunger <= 65
          ? "Balanced"
          : petStats.hunger <= 85
            ? "Full"
            : "Over target";

  useFocusEffect(
    useCallback(() => {
      // Everything inside here runs EVERY time the screen is viewed
      const checkAuth = async () => {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        router.replace("/auth/loginScreen");
      }
      }
      checkAuth();

      // Return an empty cleanup function
      return () => {};
    }, [])
  );

  const getTransform = (cfg: any) => [
  { translateX: cfg.x },
  { translateY: cfg.y },
  { scale: cfg.scale },
];

  const currentLayout = editingState ? petLayout[editingState] : null;

  const updateEditingState = (field: "x" | "y" | "scale", value: number) => {
    if (!editingState) return;

    setPetLayout((prev) => ({
      ...prev,
      [editingState]: {
        ...prev[editingState],
        [field]: value,
      },
    }));
  };

  useFocusEffect(() => {
      async function loadPet() {
          const stored = await AsyncStorage.getItem("petImages");

          if (stored) {
              setPetImages(JSON.parse(stored));
          }
      }

      loadPet();
  });
  
  const submitEnergyBalance = async () => {
    const hoursRested = Number.parseFloat(hoursRestedInput);
    const activityMinutes = Number.parseInt(activityMinutesInput, 10);
    const hasRestInput = Number.isFinite(hoursRested) && hoursRested > 0;
    const hasActivityInput = Number.isFinite(activityMinutes) && activityMinutes > 0;

    if (!hasRestInput && !hasActivityInput) {
      return;
    }

    const currentStats = applyDecay(petStats);
    const restEnergyGain = hasRestInput ? hoursRested * 12.5 : 0;
    const activityEnergyLoss = hasActivityInput
      ? (activityMinutes / 60) * activityEnergyLossPerHour[selectedActivity]
      : 0;
    const updatedStats = {
      ...currentStats,
      energy: clamp(currentStats.energy + restEnergyGain - activityEnergyLoss, 0, 100),
      lastUpdatedAt: new Date().toISOString(),
    };
    
    void Haptics.selectionAsync();
    setPetStats(updatedStats);
    await savePetStats(updatedStats);
    setHoursRestedInput("");
    setActivityMinutesInput("");
    Keyboard.dismiss();
  };

  const openProfileMenu = () => {
    setProfileMenuOpen(true);
    profileMenuProgress.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  };

  //////////////////////////////////////////////////
  // API call testing functions                   //
  //////////////////////////////////////////////////

  // Test user post function
  const createTestUser = async () => {
  try {
    const response = await fetch(
      "http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000/user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Jess",
          display_name: "Jessica",
          email: "jess@test.com",
          password: "123456",
        }),
      }
    );

      const data = await response.json();

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Test wellness_data sync function
  const testSync = async () => {
    const response = await fetch(
        "http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000/wellness/updateWellness/1",
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                food: petStats.hunger,
                water: petStats.hydration,
                energy: petStats.energy
            })
        }
    );

    const data = await response.json();

    console.log(data);
  };

  //////////////////////////////////////////////////
  //                                              //
  //////////////////////////////////////////////////

  const closeProfileMenu = () => {
    profileMenuProgress.value = withTiming(0, {
      duration: 160,
      easing: Easing.in(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(setProfileMenuOpen)(false);
      }
    });
  };


  const toggleProfileMenu = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (profileMenuOpen) {
      closeProfileMenu();
      return;
    }

    openProfileMenu();
  };

  const openTaskMenu = () => {
    cancelAnimation(taskMenuX);
    setTaskMenuOpen(true);
    taskMenuX.value = withTiming(0, {
      duration: 450,
      easing: Easing.inOut(Easing.cubic)
    });
  };

  const closeTaskMenu = () => {
    cancelAnimation(taskMenuX);
    taskMenuX.value = withTiming(TASK_MENU_CLOSED_X, {
      duration: 450,
      easing: Easing.inOut(Easing.cubic)
    }, 
    (finished) => {if(finished){ runOnJS(setTaskMenuOpen)(false);}}
    );
  };
  const taskMenuStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: taskMenuX.value }],
  }));  
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(taskMenuX.value, [TASK_MENU_CLOSED_X, 0], [0, 0.35]),
  }));
  const backdropBlurProps = useAnimatedProps(() => ({
    intensity: interpolate(taskMenuX.value, [TASK_MENU_CLOSED_X, 0], [0, 28]),
  }));
  const profileDropdownStyle = useAnimatedStyle(() => ({
    opacity: profileMenuProgress.value,
    transform: [
      { translateY: interpolate(profileMenuProgress.value, [0, 1], [-8, 0]) },
      { scale: interpolate(profileMenuProgress.value, [0, 1], [0.88, 1]) },
    ],
  }));
  const profileIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(profileMenuProgress.value, [0, 1], [1, 0.96]) },
    ],
  }));

  /////////////////////////////////////////////////
  // Pet image changer                           //
  /////////////////////////////////////////////////
  const getPetImages = useCallback(async () => {
    const token = await AsyncStorage.getItem("auth_token");
    const userId = await AsyncStorage.getItem("userId");

    if (!token || !userId) {
      router.replace("/auth/loginScreen");
      return null;
    }

    const res = await fetch(`http://ec2-18-144-66-250.us-west-1.compute.amazonaws.com:5000/pet/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    await AsyncStorage.setItem("petImages", JSON.stringify(data));
    setPetImages(data);

    return data;
  }, [router]);


  const syncPet = useCallback(async () => {
    const token = await AsyncStorage.getItem("auth_token");
    if (token) {
      await getPetImages();
    }
  }, [getPetImages]);

  useFocusEffect(
    useCallback(() => {
      void syncPet();

      return () => {};
    }, [syncPet])
  );

  useEffect(() => {
    void syncPet();

    const subscription = DeviceEventEmitter.addListener("petSaved", () => {
      void syncPet();
    });

    return () => {
      subscription.remove();
    };
  }, [syncPet]);


  /////////////////////////////////////////////////
  // Edge swipe gesture to open the task menu
  const edgeSwipeGesture = Gesture.Pan()
  .activeOffsetX(20)
  .failOffsetY([-50, 50])
  .onEnd((event) => {
    if (event.translationX > 20) {
      runOnJS(openTaskMenu)();
    }
  });

  const closeSwipeGesture = Gesture.Pan()
  .activeOffsetX([-20, 20])
  .failOffsetY([-50, 50])
  .onEnd((event) => {
    if (event.translationX < -20) {
      runOnJS(closeTaskMenu)();
    }
  });

  //////////////////////////////////////////////////
  // Load pet stats on start

  useEffect(() => {
    const load = async () => {
      const rawStored = await AsyncStorage.getItem("pet_stats");
      if (!rawStored) {
        await loadServerWellness();
      }
      const stats = await loadPetStats();
      setPetStats(stats);
    };

    load();
  }, []);

  //////////////////////////////////////////////////
  // FEEDING function with calorie input and Data update
  const addCalories = async (calories: number) => {
    const currentStats = applyDecay(petStats);

    const hungerIncreasePercent =
        (calories / MAINTENANCE_CALORIES) * 100;

    const updatedStats = {
        ...currentStats,
        hunger: Math.min(currentStats.hunger + hungerIncreasePercent, 100),
        lastUpdatedAt: new Date().toISOString(),
    };

    void Haptics.selectionAsync();

    setPetStats(updatedStats);
    await savePetStats(updatedStats);
    setCalorieIntake((current) => current + calories);
  };
  const submitCalories = async () => {
    const calories = Number.parseInt(calorieInput, 10);

    if (!Number.isFinite(calories) || calories <= 0) {
      return;
    }
    addCalories(calories);
    setCalorieInput("");
    Keyboard.dismiss();
  };
  // AI calories analysis
  const submitMealAI = async (meal: String) => {
    try{
      const nutrition = await analyzeMeal(meal);

      Alert.alert(
        "AI Meal Estimate",
        `The AI estimates your meal had ${nutrition.calories} calories with ${nutrition.certainty} certainty.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Accept",
            onPress: async () => {
              
              await addCalories(nutrition.calories)

              // setMealInput("");
              Keyboard.dismiss();
            },
          },
        ]
      );
    } catch (e) {
        console.error(e);

        Alert.alert(
          "Error",
          "Unable to analyze your meal. Please try again."
        );
      }
  }

  //////////////////////////////////////////////////
  // Watering function and Data update
  const addWater = async () => {
  void Haptics.selectionAsync();
  const currentStats = applyDecay(petStats);
  const updatedStats = {
      ...currentStats,
      hydration: Math.min(currentStats.hydration + 250, DAILY_WATER_GOAL_ML),
      lastUpdatedAt: new Date().toISOString(),
    };
    setPetStats(updatedStats);
    await savePetStats(updatedStats);
  }
  console.log(petImages?.neutral);
  // FILL WATER BAR ANIMATION
  useEffect(() => {
    waterFillWidth.value = withTiming((waterPercent / 100) * waterButtonWidth, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [waterPercent, waterButtonWidth]);

  const waterFillStyle = useAnimatedStyle(() => ({ /* Animated style for water fill bar */
    width: waterFillWidth.value,
  }));

  ///////////////////////////////////////////////////
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
    <ImageBackground
      source={require("@/images/Background.png")}
      style={styles.background}
      
    >
      <View style={styles.profileMenuWrapper}>
        <Animated.View style={profileIconStyle}>
          <Pressable
            style={styles.profileIcon}
            onPress={toggleProfileMenu}
          >
            <Image
              source={require("@/images/profile_picture_placeholder.avif")}
              style={styles.profileIconImage}
            />
          </Pressable>
        </Animated.View>

        {profileMenuOpen && (
          <Animated.View style={[styles.profileDropdownShell, profileDropdownStyle]}>
            <BlurView intensity={48} tint="light" style={styles.profileDropdown}>
              <View style={styles.profileDropdownShine} />
              <Pressable
                style={styles.profileDropdownItem}
                onPress={() => {
                  void Haptics.selectionAsync();
                  closeProfileMenu();
                  router.push("/profile");
                }}
              >
                <Text style={styles.profileDropdownText}>Profile</Text>
              </Pressable>

              <View style={styles.profileDropdownDivider} />

              <Pressable
                style={styles.profileDropdownItem}
                onPress={() => {
                  void Haptics.selectionAsync();
                  closeProfileMenu();
                  router.push("/settings");
                }}
              >
                <Text style={styles.profileDropdownText}>Settings</Text>
              </Pressable>
            </BlurView>
          </Animated.View>
        )}
      </View>
      <View style={styles.petArea}>
        <View style={styles.pet}>
          {petState === "neutral" && <Image style={[styles.dogNeutral, { transform: getTransform(petLayout.neutral) }]} source={{uri: `${petImages?.neutral}?t=${Date.now()}`}} resizeMode="contain" />}
          {petState === "happy" && <Image style={[styles.dogHappy, { transform: getTransform(petLayout.happy) }]} source={{uri: `${petImages?.happy}?t=${Date.now()}`}} resizeMode="contain" />}
          {petState === "sad" && <Image style={[styles.dogSad, { transform: getTransform(petLayout.sad) }]} source={{uri: `${petImages?.sad}?t=${Date.now()}`}} resizeMode="contain" />}
          <View style={styles.petShadow} />
        </View>
      </View>
      {/* Backdrop for Menu */}
      {taskMenuOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={closeTaskMenu}>
          <AnimatedBlurView
            animatedProps={backdropBlurProps}
            style={styles.backdropBlur}
            tint="dark"
          />
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
      )}
      <GestureDetector gesture={closeSwipeGesture}>
          <Animated.View style={[styles.taskMenu, taskMenuStyle, { backgroundColor: activeTabData.color }]}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={[
                  styles.fileTab,
                  {
                    top: tab.top,
                    zIndex: activeTab === tab.id ? 11 : tab.zIndex,
                    backgroundColor: tab.color,
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <View style={styles.fileTabTextWrapper}>
                  <Text style={styles.fileTabText} numberOfLines={1}>
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            ))}
            {/* Tab Content Switching */}
            {activeTab === "tasks" && (
              <PetInfoPanel
                foodState={foodState}
                foodPercent={foodPercent}
                calorieInput={calorieInput}
                mealInput={mealInput}
                setCalorieInput={setCalorieInput}
                setMealInput={setMealInput}
                submitCalories={submitCalories}
                submitMealAI={submitMealAI}
                setWaterButtonWidth={setWaterButtonWidth}
                addWater={addWater}
                waterFillStyle={waterFillStyle}
                petStats={petStats}
                energyPercent={energyPercent}
                hoursRestedInput={hoursRestedInput}
                setHoursRestedInput={setHoursRestedInput}
                activityMenuOpen={activityMenuOpen}
                setActivityMenuOpen={setActivityMenuOpen}
                selectedActivity={selectedActivity}
                setSelectedActivity={setSelectedActivity}
                activityMinutesInput={activityMinutesInput}
                setActivityMinutesInput={setActivityMinutesInput}
                submitEnergyBalance={submitEnergyBalance}
                setPetState={setPetState}
              />
            )}

          {activeTab === "shop" && (
            <View>
              {/* TEMP TESTING BUTTONS */}
              <Text style={styles.taskMenuTitle}>Shop</Text>
                <Pressable onPress={createTestUser} style={{backgroundColor: "#fff", padding: 12, borderRadius: 8, marginTop: 16}}>
                  <Text>Create Test User</Text>
                </Pressable>
                <Pressable onPress={testSync} style={{backgroundColor: "#fff", padding: 12, borderRadius: 8, marginTop: 16}}>
                  <Text>Test Wellness Sync</Text>
                </Pressable>
              {/* //////////////////// */}
            </View>
          )}

          {activeTab === "items" && (
            <View>
              <Text style={styles.taskMenuTitle}>Items</Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {!taskMenuOpen && (
        <GestureDetector gesture={edgeSwipeGesture}>
          <View style={styles.edgeSwipeZone} />
        </GestureDetector>
      )}

      <Pressable onPress={() => {setShowStatePicker(true)}} style={{
    position: "absolute",
    top: "7%",
    right: "20%",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 20,
    zIndex: 999,
    elevation: 10,
  }}><Text>✏️</Text></Pressable>

  {showStatePicker && (
  <View style={styles.overlay}>
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => setShowStatePicker(false)}
    />

    <View style={styles.statePicker}>
      <BlurView intensity={10} tint="light">
        {/* <Text style={{fontWeight: "bold", marginBottom: 12}}>
          Choose a state
        </Text> */}

        <Pressable
          onPress={() => {
            setEditingState("happy");
            setShowStatePicker(false);
          }}>
          <Text style={styles.stateOption}>😊</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setEditingState("neutral");
            setShowStatePicker(false);
          }}>
          <Text style={styles.stateOption}>😐</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setEditingState("sad");
            setShowStatePicker(false);
          }}>
          <Text style={styles.stateOption}>😢</Text>
        </Pressable>
      </BlurView>
    </View>
  </View>
)}

      {editingState && (
  <View style={styles.overlay}>
    
    {/* tap outside to close */}
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => setEditingState(null)}
    />

    {/* bottom sheet */}
    <View style={styles.sheet}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject}>
        <Text style={{ fontSize: 16, fontWeight: "bold", textAlign:"center", marginTop: 20 }}>
          Adjust pet position at state: {editingState}
        </Text>

        <Slider
          minimumValue={-50}
          maximumValue={50}
          minimumTrackTintColor="#f3a94f"
          maximumTrackTintColor="#ffffff4f"
          thumbTintColor="#f3a94f"
          value={currentLayout?.x ?? 0}
          onValueChange={(val) => updateEditingState("x", val)}
          style={styles.slider}
        />
        <Text style={styles.sliderLabel}>X Position</Text>


        <Slider
          minimumValue={-100}
          maximumValue={100}
          minimumTrackTintColor="#f3a94f"
          maximumTrackTintColor="#ffffff4f"
          thumbTintColor="#f3a94f"
          value={currentLayout?.y ?? 0}
          onValueChange={(val) => updateEditingState("y", val)}
          style={styles.slider}
        />
        <Text style={styles.sliderLabel}>Y Position</Text>

        <Slider
          minimumValue={0.5}
          maximumValue={2}
          minimumTrackTintColor="#f3a94f"
          maximumTrackTintColor="#ffffff4f"
          thumbTintColor="#f3a94f"
          value={currentLayout?.scale ?? 1}
          onValueChange={(val) => updateEditingState("scale", val)}
          style={styles.slider}
        />
        <Text style={styles.sliderLabel}>Scale</Text>
      </BlurView>
    </View>
  </View>
)}

    </ImageBackground>
    </>
  );
}

