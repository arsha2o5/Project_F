import React, { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Text, TextInput, View, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
  MAINTENANCE_CALORIES,
  WATER_SERVING_ML,
  activityOptions,
  challenges,
  careActionLabels,
  type ActivityType,
} from "../constants";
import { styles } from "../habitat-styles";

type PetInfoPanelProps = {
  foodState: string;
  foodPercent: number;
  calorieInput: string;
  mealInput: string;
  setCalorieInput: (value: string) => void;
  setMealInput: (value: string) => void;
  submitCalories: () => void;
  submitMealAI: (meal: string) => void;
  setWaterButtonWidth: (width: number) => void;
  addWater: () => void;
  waterFillStyle: any;
  petStats: { hydration: number };
  energyPercent: number;
  hoursRestedInput: string;
  setHoursRestedInput: (value: string) => void;
  activityMenuOpen: boolean;
  setActivityMenuOpen: Dispatch<SetStateAction<boolean>>;
  selectedActivity: ActivityType;
  setSelectedActivity: (activity: ActivityType) => void;
  activityMinutesInput: string;
  setActivityMinutesInput: (value: string) => void;
  submitEnergyBalance: () => void;
  setPetState?: (state: string) => void;
};

export function PetInfoPanel({
  foodState,
  foodPercent,
  calorieInput,
  mealInput,
  setCalorieInput,
  setMealInput,
  submitCalories,
  submitMealAI,
  setWaterButtonWidth,
  addWater,
  waterFillStyle,
  petStats,
  energyPercent,
  hoursRestedInput,
  setHoursRestedInput,
  activityMenuOpen,
  setActivityMenuOpen,
  selectedActivity,
  setSelectedActivity,
  activityMinutesInput,
  setActivityMinutesInput,
  submitEnergyBalance,
  setPetState,
}: PetInfoPanelProps) {
    // Compute per-metric influence scores (0-100 scale)
    // Hunger: best at 50 -> 100 points. Linear falloff to 0 at 0 and 100.
    const hungerScore = Math.max(0, 100 - Math.abs(foodPercent - 50) * 2);

    // Water: best at 2000 ml -> 100 points. We map difference to a 0-100 score.
    const hydration = petStats?.hydration ?? 0;
    // difference in ml -> scale so that 0 diff = 100, 2000 diff = 0
    const waterScore = Math.max(0, 100 - (Math.abs(2000 - hydration) / 20));

    // Energy: best between 50 and 75 -> 100 points. 0 -> 0 points. 100 -> 50 points.
    const ep = Math.max(0, Math.min(100, Math.round(energyPercent)));
    let energyScore = 0;
    if (ep === 0) energyScore = 0;
    else if (ep <= 50) energyScore = (ep / 50) * 100; // 0..50 -> 0..100
    else if (ep <= 75) energyScore = 100; // 50..75 -> 100
    else energyScore = 100 - (ep - 75) * 2; // 75..100 -> 100..50

    // Combined overall score 0-300
    const overallScore = hungerScore + waterScore + energyScore;
    const overallPercent = Math.min(100, (overallScore / 300) * 100);
    const overallStateKey = overallScore < 100 ? "sad" : overallScore < 200 ? "neutral" : "happy";
    const overallStateLabel = overallStateKey === "sad" ? "Sad" : overallStateKey === "neutral" ? "Neutral" : "Happy";

    useEffect(() => {
        if (setPetState) setPetState(overallStateKey);
    }, [overallStateKey, setPetState]);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.taskMenuTitle}>Info Panel</Text>

        {/* Overall state panel */}
        <View style={[styles.balancePanel, {paddingBottom: 30, marginBottom: 10}]}>
            <View style={styles.balanceHeader}>
            <View>
                <Text style={styles.balanceTitle}>Overall State</Text>
                <Text style={styles.balanceSubtitle}>{Math.round(overallScore)}/300</Text>
            </View>
            <Text style={styles.balanceState}>{overallStateLabel}</Text>
            </View>
            <View style={styles.balanceGradientTrack}>
            <View style={[styles.balanceGradientSegment, styles.balanceGradientRed]} />
            <View style={[styles.balanceGradientSegment, styles.balanceGradientOrange]} />
            <View style={[styles.balanceGradientSegment, styles.balanceGradientGreen]} />
            <View
                style={[
                styles.balancePointer,
                { left: `${overallPercent}%` },
                ]}
            />
            </View>
        </View>

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

            {/* Manual Input */}
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

            {/* Ask AI */}
            <View style={styles.balanceEntryRow}>
            <TextInput
                value={mealInput}
                onChangeText={setMealInput}
                placeholder="Ask AI. What & how much?"
                placeholderTextColor="#8b8171"
                style={styles.balanceInput}
                returnKeyType="done"
            />
            <Pressable style={styles.balanceAddButton} onPress={() => submitMealAI(mealInput)}>
                <Text style={styles.balanceAddButtonText}>✨</Text>
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
                    onPress={() => setActivityMenuOpen(!activityMenuOpen)}
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
  );
}