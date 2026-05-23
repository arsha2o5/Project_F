import {useState} from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const TASK_MENU_WIDTH = SCREEN_WIDTH * 0.90;
const TASK_MENU_PEEK = 10;
const TASK_MENU_CLOSED_X = -TASK_MENU_WIDTH + TASK_MENU_PEEK;

export default function HabitatScreen() {
  const [taskMenuOpen, setTaskMenuOpen] = useState(false);
  const taskMenuX = useSharedValue(TASK_MENU_CLOSED_X);

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
  
  // Edge swipe gesture to open the task menu
  const edgeSwipeGesture = Gesture.Pan()
  .activeOffsetX(20)
  .failOffsetY([-20, 20])
  .onEnd((event) => {
    if (event.translationX > 20) {
      runOnJS(openTaskMenu)();
    }
  });

  const closeSwipeGesture = Gesture.Pan()
  .activeOffsetX([-20, 20])
  .failOffsetY([-20, 20])
  .onEnd((event) => {
    if (event.translationX < -20) {
      runOnJS(closeTaskMenu)();
    }
  });

  // Rigid types for tab state and colors
  type ActiveTab = "tasks" | "shop" | "items";


  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");

  const tabColors: Record<ActiveTab, string> = {
    tasks: "#ffedc7",
    shop: "#c1f1ff",
    items: "#ffba95",
  };
  //___________________________________________
  return (
    <ImageBackground
      source={require("@/images/Background.png")}
      style={styles.background}
    >
      <View style={styles.petArea}>
        <Image style={styles.dog} source={require("@/images/Dog.png")} />
      </View>
      {/* Backdrop for Menu */}
      {taskMenuOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={closeTaskMenu}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
      )}
      <GestureDetector gesture={closeSwipeGesture}>
        <Animated.View style={[styles.taskMenu, taskMenuStyle, { backgroundColor: tabColors[activeTab] }]}>
          <Pressable style={[styles.fileTab, styles.tasksTab, activeTab === "tasks" && styles.activeFileTab]} onPress={() => setActiveTab("tasks")}>
            <View style={styles.fileTabTextWrapper}>
              <Text style={styles.fileTabText} numberOfLines={1}>
                Tasks
              </Text>
            </View>
          </Pressable>

          <Pressable style={[styles.fileTab, styles.shopTab, activeTab === "shop" && styles.activeFileTab]} onPress={() => setActiveTab("shop")}>
            <View style={styles.fileTabTextWrapper}>
              <Text style={styles.fileTabText} numberOfLines={1}>
                Shop
              </Text>
            </View>
          </Pressable>

          <Pressable style={[styles.fileTab, styles.itemsTab, activeTab === "items" && styles.activeFileTab]} onPress={() => setActiveTab("items")}>
            <View style={styles.fileTabTextWrapper}>
              <Text style={styles.fileTabText} numberOfLines={1}>
                Items
              </Text>
            </View> 
          </Pressable>
          {/* Tab Content Switching */}
          {activeTab === "tasks" && (
            <View>
              <Text style={styles.taskMenuTitle}>Today's Care</Text>
            </View>
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

      <GestureDetector gesture={edgeSwipeGesture}>
        <View style={styles.edgeSwipeZone} />
      </GestureDetector>

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
  activeFileTab: {
    zIndex:11,

  },
  tasksTab: {
    top: 36,
    zIndex: 10,
    backgroundColor: "#ffedc7",
    boxShadow: "0px 5px 0px rgba(0, 0, 0, 0.1)",
  },
  shopTab: {
    top: 36 + 120 -20,
    zIndex: 9,
    backgroundColor: "#c1f1ff",
    boxShadow: "0px 5px 0px rgba(0, 0, 0, 0.1)",
  },
  itemsTab: {
    top: 36 + 240 -40,
    zIndex: 8,
    backgroundColor: "#ffba95",
    boxShadow: "0px -5px 0px rgba(0, 0, 0, 0.1)",
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
    zIndex: -1,
  },
});




