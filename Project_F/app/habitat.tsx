import {useEffect, useState} from "react";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import {router} from "expo-router";
import {
  Image,
  Keyboard,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Pressable
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
import { applyDecay, defaultPetStats } from "@/lib/petstats";
import { loadPetStats, savePetStats } from "@/lib/petstorage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TASK_MENU_WIDTH = SCREEN_WIDTH * 0.90;
const TASK_MENU_PEEK = 10;
const TASK_MENU_CLOSED_X = -TASK_MENU_WIDTH + TASK_MENU_PEEK;
const MAINTENANCE_CALORIES = 2000;
const DAILY_WATER_GOAL_ML = 2000;
const WATER_SERVING_ML = 250;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type ActiveTab = "tasks" | "shop" | "items";
type CareAction = "water" | "feed" | "rest" | "clean";
type ActivityType =
  | "Walking"
  | "Running"
  | "Cycling"
  | "Weight training"
  | "Swimming"
  | "Yoga"
  | "Hiking"
  | "Sports";

const tabs: {
  id: ActiveTab;
  label: string;
  color: string;
  top: number;
  zIndex: number;
}[] = [
  { id: "tasks", label: "Tasks", color: "#ffedc7", top: 36, zIndex: 10 },
  { id: "shop", label: "Shop", color: "#c1f1ff", top: 36 + 120 - 20, zIndex: 9 },
  { id: "items", label: "Items", color: "#ffba95", top: 36 + 240 - 40, zIndex: 8 },
];

const challenges: {
  id: string;
  title: string;
  icon: string;
  action: CareAction;
  habitatPrompt: string;
}[] = [
  {
    id: "sleep",
    title: "Sleep Routine",
    icon: "REST",
    action: "rest",
    habitatPrompt: "Tuck in your pet",
  },
  {
    id: "cleaning",
    title: "Clean Space",
    icon: "CLEAN",
    action: "clean",
    habitatPrompt: "Clean your pet",
  },
];

const careActionLabels: Record<CareAction, string> = {
  water: "Water",
  feed: "Food",
  rest: "Rest",
  clean: "Clean",
};

const activityOptions: ActivityType[] = [
  "Walking",
  "Running",
  "Cycling",
  "Weight training",
  "Swimming",
  "Yoga",
  "Hiking",
  "Sports",
];

const activityEnergyLossPerHour: Record<ActivityType, number> = {
  Walking: 6,
  Running: 18,
  Cycling: 14,
  "Weight training": 16,
  Swimming: 20,
  Yoga: 5,
  Hiking: 12,
  Sports: 17,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function HabitatScreen() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [taskMenuOpen, setTaskMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [availableCareActions, setAvailableCareActions] = useState<CareAction[]>([]);
  const [calorieInput, setCalorieInput] = useState("");
  const [calorieIntake, setCalorieIntake] = useState(0);
  const [hoursRestedInput, setHoursRestedInput] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>("Walking");
  const [activityMenuOpen, setActivityMenuOpen] = useState(false);
  const [activityMinutesInput, setActivityMinutesInput] = useState("");
  const taskMenuX = useSharedValue(TASK_MENU_CLOSED_X);
  const profileMenuProgress = useSharedValue(0);
  const activeTabData = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const calorieRatio = calorieIntake / MAINTENANCE_CALORIES;
  const [petStats, setPetStats] = useState(defaultPetStats);
  const foodPercent = petStats.hunger;
  const energyPercent = petStats.energy;
  const waterPercent = clamp((petStats.hydration / DAILY_WATER_GOAL_ML) * 100, 0, 100);
  const [waterButtonWidth, setWaterButtonWidth] = useState(0);
  const waterFillWidth = useSharedValue(0);
  const foodState =
    calorieRatio < 0.65
      ? "Low"
      : calorieRatio < 0.85
        ? "Rising"
        : calorieRatio <= 1.1
          ? "Balanced"
          : calorieRatio <= 1.25
            ? "Full"
            : "Over target";

  const completeChallenge = (challengeId: string, action: CareAction) => {
    setCompletedChallenges((currentChallenges) =>
      currentChallenges.includes(challengeId)
        ? currentChallenges
        : [...currentChallenges, challengeId]
    );
    setAvailableCareActions((currentActions) =>
      currentActions.includes(action) ? currentActions : [...currentActions, action]
    );
  };

  const submitEnergyBalance = async () => {
    const hoursRested = Number.parseFloat(hoursRestedInput);
    const activityMinutes = Number.parseInt(activityMinutesInput, 10);
    const hasRestInput = Number.isFinite(hoursRested) && hoursRested > 0;
    const hasActivityInput = Number.isFinite(activityMinutes) && activityMinutes > 0;

    if (!hasRestInput && !hasActivityInput) {
      return;
    }

    const currentStats = applyDecay(petStats);
    const restEnergyGain = hasRestInput ? hoursRested * 12 : 0;
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
      const stats = await loadPetStats();
      setPetStats(stats);
      await savePetStats(stats);
    };

    load();
  }, []);

  //////////////////////////////////////////////////
  // FEEDING function with calorie input and Data update
  const submitCalories = async () => {
    const calories = Number.parseInt(calorieInput, 10);

    if (!Number.isFinite(calories) || calories <= 0) {
      return;
    }
    const currentStats = applyDecay(petStats);
    const hungerIncreasePercent = (calories / MAINTENANCE_CALORIES) * 100;
    const updatedStats = {
      ...currentStats,
      hunger: Math.min(currentStats.hunger + hungerIncreasePercent, 100),
      lastUpdatedAt: new Date().toISOString(),
    };

    void Haptics.selectionAsync();
    setPetStats(updatedStats);
    await savePetStats(updatedStats);
    setCalorieIntake((currentCalories) => currentCalories + calories);
    setCalorieInput("");
    Keyboard.dismiss();
  };

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
  // Energy / Activity functions and Data update
  const addEnergy = async () => {
    const calories = Number.parseInt(calorieInput, 10);

    if (!Number.isFinite(calories) || calories <= 0) {
      return;
    }
    const currentStats = applyDecay(petStats);
    const hungerIncreasePercent = (calories / MAINTENANCE_CALORIES) * 100;
    const updatedStats = {
      ...currentStats,
      hunger: Math.min(currentStats.hunger + hungerIncreasePercent, 100),
      lastUpdatedAt: new Date().toISOString(),
    };

    void Haptics.selectionAsync();
    setPetStats(updatedStats);
    await savePetStats(updatedStats);
    setCalorieIntake((currentCalories) => currentCalories + calories);
    setCalorieInput("");
    Keyboard.dismiss();
  };

  ///////////////////////////////////////////////////
  return (
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
        <Image style={styles.dog} source={require("@/images/Dog.png")} />
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
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.taskMenuTitle}>Info Panel</Text>
                {/* <View style={styles.taskSnapshot}>
                  <View style={styles.taskSnapshotHeader}>
                    <View>
                      <Text style={styles.taskSnapshotLabel}>Daily progress</Text>
                      <Text style={styles.taskSnapshotValue}>
                        {completedTaskCount}/{totalTaskCount} tasks
                      </Text>
                    </View>
                    <Text style={styles.taskSnapshotPercent}>{completionPercent}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${completionPercent}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.taskStatsRow}>
                    <View style={styles.taskStat}>
                      <Text style={styles.taskStatValue}>{totalTaskCount - completedTaskCount}</Text>
                      <Text style={styles.taskStatLabel}>Left</Text>
                    </View>
                    <View style={styles.taskStat}>
                      <Text style={styles.taskStatValue}>{readyCareCount}</Text>
                      <Text style={styles.taskStatLabel}>Ready</Text>
                    </View>
                    <View style={styles.taskStat}>
                      <Text style={styles.taskStatValue}>{completedTaskCount}</Text>
                      <Text style={styles.taskStatLabel}>Done</Text>
                    </View>
                  </View>
                </View> */}

                {/* <Text style={styles.balanceSubtitle}>
                  Food: {Math.round(foodPercent)}%
                </Text>
                <Text style={styles.balanceSubtitle}>
                  Hydration: {Math.round(petStats.hydration)} ml
                </Text> */}

                <View style={styles.balancePanel}>
                  <View style={styles.balanceHeader}>
                    <View>
                      <Text style={styles.balanceTitle}>Food balance</Text>
                      <Text style={styles.balanceSubtitle}>
                        {MAINTENANCE_CALORIES}c. maintenance
                      </Text>
                    </View>
                    <Text style={styles.balanceState}>{foodState}</Text>
                  </View>
                  <View style={styles.balanceGradientTrack}>
                    <View style={[styles.balanceGradientSegment, styles.balanceGradientRed]} />
                    <View style={[styles.balanceGradientSegment, styles.balanceGradientOrange]} />
                    <View style={[styles.balanceGradientSegment, styles.balanceGradientGreen]} />
                    <View style={[styles.balanceGradientSegment, styles.balanceGradientOrange]} />
                    <View style={[styles.balanceGradientSegment, styles.balanceGradientRed]} />
                    <View
                      style={[
                        styles.balancePointer,
                        { left: `${foodPercent}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.balanceScaleLabels}>
                    <Text style={styles.balanceScaleLabel}>Hungry</Text>
                    <Text style={styles.balanceScaleLabel}>Satisfied</Text>
                    <Text style={styles.balanceScaleLabel}>Overfed</Text>
                  </View>
                  <View style={styles.balanceEntryRow}>
                    <TextInput
                      value={calorieInput}
                      onChangeText={setCalorieInput}
                      keyboardType="number-pad"
                      placeholder="Add calories"
                      placeholderTextColor="#8b8171"
                      style={styles.balanceInput}
                      returnKeyType="done"
                    />
                    <Pressable style={styles.balanceAddButton} onPress={submitCalories}>
                      <Text style={styles.balanceAddButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={styles.waterButton}
                  onLayout={(event) => setWaterButtonWidth(event.nativeEvent.layout.width)}
                  onPress={addWater}
                >
                  <Animated.View style={[styles.waterButtonFillBar, waterFillStyle]} />
                  <View style={styles.waterCupSlot}>
                    <Text style={styles.waterCupPlaceholder}>Cup</Text>
                  </View>
                  <View style={styles.waterButtonTextGroup}>
                    <Text style={styles.waterButtonTitle}>Water</Text>
                    <Text style={styles.waterButtonSubtitle}>
                      +{WATER_SERVING_ML} ml
                    </Text>
                  </View>
                  <Text style={styles.waterAmount}>{Math.round(petStats.hydration)} ml</Text>
                </Pressable>

                <View style={styles.balancePanel}>
                  <View style={styles.balanceHeader}>
                    <View>
                      <Text style={styles.balanceTitle}>Energy Balance</Text>
                      <Text style={styles.balanceSubtitle}>
                        {Math.round(energyPercent)}% energy
                      </Text>
                    </View>
                    <Text style={styles.balanceState}>
                      {energyPercent < 35 ? "Tired" : energyPercent < 70 ? "Resting" : "Energized"}
                    </Text>
                  </View>
                  <View style={styles.balanceGradientTrack}>
                    <View style={[styles.balanceGradientSegment, { backgroundColor: '#4A90E2' }]} />
                    <View style={[styles.balanceGradientSegment, { backgroundColor: '#70C4BC' }]} />
                    <View style={[styles.balanceGradientSegment, { backgroundColor: '#B2E782' }]} />
                    <View style={[styles.balanceGradientSegment, { backgroundColor: '#e7ef74' }]} />
                    <View style={[styles.balanceGradientSegment, { backgroundColor: '#ffd91b' }]} />
                    <View
                      style={[
                        styles.balancePointer,
                        { left: `${energyPercent}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.balanceScaleLabels}>
                    <Text style={styles.balanceScaleLabel}>Exhausted</Text>
                    <Text style={styles.balanceScaleLabel}>Rested</Text>
                    <Text style={styles.balanceScaleLabel}>Energized</Text>
                  </View>
                  <View style={styles.energyInputGroup}>
                    <View style={styles.energyInputStack}>
                      <TextInput
                        value={hoursRestedInput}
                        onChangeText={setHoursRestedInput}
                        keyboardType="decimal-pad"
                        placeholder="Hours rested / nap"
                        placeholderTextColor="#8b8171"
                        style={styles.balanceInput}
                        returnKeyType="done"
                      />
                      <View style={styles.activityInputRow}>
                        <Pressable
                          style={styles.activityDropdown}
                          onPress={() => setActivityMenuOpen((current) => !current)}
                        >
                          <Text style={styles.activityDropdownLabel}>{activityMenuOpen ? "▲" : "▼"}</Text>
                          <Text style={styles.activityDropdownValue}>{selectedActivity}</Text>
                        </Pressable>
                      <TextInput
                        value={activityMinutesInput}
                        onChangeText={setActivityMinutesInput}
                        keyboardType="number-pad"
                        placeholder="Minutes active"
                        placeholderTextColor="#8b8171"
                        style={styles.activityMinutesInput}
                        returnKeyType="done"
                      />
                      </View>
                    </View>
                    <Pressable style={styles.energyAddButton} onPress={submitEnergyBalance}>
                      <Text style={styles.balanceAddButtonText}>+</Text>
                    </Pressable>
                  </View>
                  {activityMenuOpen && (
                    <View style={styles.activityDropdownMenu}>
                      {activityOptions.map((activity) => (
                        <Pressable
                          key={activity}
                          style={[
                            styles.activityDropdownOption,
                            selectedActivity === activity && styles.selectedActivityOption,
                          ]}
                          onPress={() => {
                            setSelectedActivity(activity);
                            setActivityMenuOpen(false);
                          }}
                        >
                          <Text style={styles.activityDropdownOptionText}>{activity}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* <View style={styles.careStatePanel}>
                  <Text style={styles.careStateTitle}>Pet state</Text>
                  <View style={styles.careMeterRow}>
                    <View style={styles.careMeterText}>
                      <Text style={styles.careMeterLabel}>Water</Text>
                      <Text style={styles.careMeterStatus}>{Math.round(petStats.hydration)} ml</Text>
                    </View>
                    <View style={styles.careMeterTrack}>
                      <View
                        style={[
                          styles.waterMeterFill,
                          { width: `${waterPercent}%` },
                        ]}
                      />
                    </View>
                  </View>
                  {challenges.map((challenge) => {
                    const completed = completedChallenges.includes(challenge.id);
                    const ready = availableCareActions.includes(challenge.action);
                    const careLevel = completed ? (ready ? 72 : 100) : 25;
                    const careStatus = completed ? (ready ? "Ready" : "Cared") : "Needs task";

                    return (
                      <View key={challenge.action} style={styles.careMeterRow}>
                        <View style={styles.careMeterText}>
                          <Text style={styles.careMeterLabel}>
                            {careActionLabels[challenge.action]}
                          </Text>
                          <Text style={styles.careMeterStatus}>{careStatus}</Text>
                        </View>
                        <View style={styles.careMeterTrack}>
                          <View
                            style={[
                              styles.careMeterFill,
                              { width: `${careLevel}%` },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View> */}

                {/* <View style={styles.challengeGrid}>
                  {challenges.map((challenge) => {
                    const completed = completedChallenges.includes(challenge.id);

                    return (
                      <Pressable
                        key={challenge.id}
                        style={[
                          styles.challengeCard,
                          completed && styles.completedChallengeCard,
                        ]}
                        onPress={() => completeChallenge(challenge.id, challenge.action)}
                      >
                        <View style={styles.challengeIcon}>
                          <Text style={styles.challengeIconText}>{challenge.icon}</Text>
                        </View>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <Text style={styles.challengeState}>
                          {completed ? "Ready" : "Complete"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View> */}
              </ScrollView>
            )}

          {activeTab === "shop" && (
            <View>
              <Text style={styles.taskMenuTitle}>Shop</Text>
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

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  petArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    position: "absolute",
    top: "30%",
    fontSize: 20,
    fontWeight: "bold",
  },
  dog: {
    position: "absolute",
    top: "50%",
    width: 200,
    height: 200,
  },
  taskMenu: {
    position: "absolute",
    left: 0,
    top: 72,
    bottom: 72,
    zIndex: 5,
    width: TASK_MENU_WIDTH,
    padding: 18,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#ffedc7",
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: .3,
    shadowRadius: 6,
  },

  taskMenuTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2f2d29",
  },

  taskSnapshot: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.58)",
  },

  taskSnapshotHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  taskSnapshotLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#766d5d",
    textTransform: "uppercase",
  },

  taskSnapshotValue: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: "900",
    color: "#2f2d29",
  },

  taskSnapshotPercent: {
    fontSize: 28,
    fontWeight: "900",
    color: "#3d5f48",
  },

  progressTrack: {
    height: 12,
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "rgba(47,45,41,0.14)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#6fbe73",
  },

  taskStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  taskStat: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.52)",
  },

  taskStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2f2d29",
  },

  taskStatLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
    color: "#766d5d",
  },

  balancePanel: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  balanceTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2f2d29",
  },

  balanceSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "#766d5d",
  },

  balanceState: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "900",
    color: "#2f2d29",
    backgroundColor: "rgba(255,255,255,0.62)",
  },

  balanceGradientTrack: {
    height: 18,
    marginTop: 16,
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  balanceGradientSegment: {
    flex: 1,
  },

  balanceGradientRed: {
    backgroundColor: "#dc5f4f",
  },

  balanceGradientOrange: {
    backgroundColor: "#f2a65a",
  },

  balanceGradientGreen: {
    backgroundColor: "#78bd77",
  },

  balancePointer: {
    position: "absolute",
    top: -7,
    width: 4,
    height: 32,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: "#263033",
  },

  balanceScaleLabels: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  balanceScaleLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#766d5d",
  },

  balanceEntryRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  balanceInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    fontSize: 15,
    fontWeight: "800",
    color: "#2f2d29",
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  balanceAddButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#2f2d29",
  },

  balanceAddButtonText: {
    marginTop: -2,
    fontSize: 28,
    fontWeight: "600",
    color: "#ffffff",
  },

  energyInputGroup: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },

  energyInputStack: {
    flex: 1,
    gap: 10,
  },

  activityInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  activityMinutesInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    fontSize: 15,
    fontWeight: "800",
    color: "#2f2d29",
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  energyAddButton: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#2f2d29",
  },

  activityDropdown: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    position: "relative",
  },

  activityDropdownLabel: {
    fontSize: 12,
    marginRight: 8,
    fontWeight: "900",
    color: "#766d5d",
    textTransform: "uppercase",
  },

  activityDropdownValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2f2d29",
  },

  activityDropdownMenu: {
    marginTop: 6,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "rgb(255, 255, 255)",
    zIndex: 30,
  },

  activityDropdownOption: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  selectedActivityOption: {
    backgroundColor: "rgba(112,196,188,0.35)",
  },

  activityDropdownOptionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2f2d29",
  },

  waterButton: {
    minHeight: 76,
    marginTop: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#3cb6f85d",
    borderColor: "#ffffff",
    borderWidth: 2,
    overflow: "hidden",
    zIndex: 0, 
  },
  waterButtonFillBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    borderRadius: 18,
    backgroundColor: "#3cb6f8",
  },
  waterCupSlot: {
    zIndex: 2,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.34)",
  },

  waterCupPlaceholder: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0e5b83",
    zIndex: 2,
  },

  waterButtonTextGroup: {
    flex: 1,
    zIndex: 2,
  },

  waterButtonTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
  },

  waterButtonSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.78)",
  },

  waterAmount: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
    zIndex: 2,
  },

  careStatePanel: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.42)",
  },

  careStateTitle: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "900",
    color: "#2f2d29",
  },

  careMeterRow: {
    gap: 6,
    marginTop: 8,
  },

  careMeterText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  careMeterLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#3b3a35",
  },

  careMeterStatus: {
    fontSize: 11,
    fontWeight: "800",
    color: "#766d5d",
  },

  careMeterTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: 6,
    backgroundColor: "rgba(47,45,41,0.13)",
  },

  careMeterFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#66b9c4",
  },

  waterMeterFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#4da8dc",
  },

  challengeGrid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  challengeCard: {
    width: "47%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#d8d8d8",
  },

  completedChallengeCard: {
    backgroundColor: "#a8df9f",
  },

  challengeIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.8)",
  },

  challengeIconText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#3b3a35",
  },

  challengeTitle: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: "#2f2d29",
  },

  challengeState: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#565248",
  },

  petStatusPanel: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 42,
    alignItems: "center",
    gap: 10,
  },

  petStatusText: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    overflow: "hidden",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#2f2d29",
    backgroundColor: "rgba(255,255,255,0.78)",
  },

  careActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },

  careActionButton: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 19,
    backgroundColor: "#f8f2e7",
  },

  careActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3b3a35",
   },

  fileTab: {
    position: "absolute",
    right: -TASK_MENU_PEEK- 20,
    top: 36,
    zIndex: 10,
    width: TASK_MENU_PEEK + 20.2,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#ffedc7",
  },
  
  fileTabTextWrapper: {
    width: 70,
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
  },

  fileTabText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4a3717",
  },

  edgeSwipeZone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 6,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },

  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  // Profile Menu
  profileMenuWrapper: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 20,
    alignItems: "flex-end",
  },

  profileIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#ffffff",
    backgroundColor: "#f8f2e7",
    shadowColor: "#1f2a2e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
  },

  profileIconImage: {
    width: "100%",
    height: "100%",
  },
 
  profileDropdownShell: {
    marginTop: 10,
    width: 148,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.64)",
    backgroundColor: "rgba(255,255,255,0.18)",
    shadowColor: "#223238",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },

  profileDropdown: {
    overflow: "hidden",
  },

  profileDropdownShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 15,
  },

  profileDropdownItem: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  profileDropdownDivider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.42)",
  },

  profileDropdownText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#263033",
  },
});
