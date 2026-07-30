import { StyleSheet } from "react-native";

import { TASK_MENU_WIDTH, TASK_MENU_PEEK } from "./constants";
export const styles = StyleSheet.create({
      background: {
        flex: 1,
      },
      petArea: {
        flex: 1,
        // alignItems: "center",
        // justifyContent: "center",
      },
      welcomeText: {
        position: "absolute",
        top: "30%",
        fontSize: 20,
        fontWeight: "bold",
      },
      pet: {
        position: "relative",
        top: "50%",
        left: "35%",
        width: 150,
        height: 200,
      },
      dogSad: {
        position: "absolute",
        width: "100%",
        height: "100%",
        // transform: [{translateY: 40}, {scale: 1.2}],
        zIndex: 1
      },
      dogNeutral: {
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 1
      },
      dogHappy: {
        position: "absolute",
        width: "100%",
        height: "100%",
        transform: [{translateY: 10}, {scale: 1.2}],
        zIndex: 1
      },
      petShadow: {
        position: "absolute",
        top: "60%",
        left: "10%",
        width: 100,
        height: 50,
        borderRadius: "50%",
        backgroundColor: "rgba(0,0,0,0.3)",
        transform: [{ scaleX: 1.5 }],
        zIndex: 0
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
        zIndex:5
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
      overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        alignItems: "center",
        justifyContent: "flex-end",
      },

      statePicker: {
        position: "absolute",
        top: "12%",
        right: "18.5%",
        borderRadius: 20,
        borderColor: "#ffffffd5",
        borderCurve: "continuous",
        borderWidth: 2,
        overflow: "hidden"
      },
      stateOption: {
        fontSize: 15,
        borderBottomColor: "#ffffff86",
        borderBottomWidth: 1,
        padding: 10,
        justifyContent: "center",
        paddingHorizontal: 16,
      },
      sheet: {
        width: "90%",
        height: "25%",
        borderRadius: 20,
        borderColor: "#ffffffd5",
        borderCurve: "continuous",
        borderWidth: 2,
        overflow: "hidden",
        elevation: 20,
      },
      slider:{
        width: "80%",
        alignSelf: "center",
        marginTop: 5,
      },
      sliderLabel: {
        textAlign: "center",
        fontSize: 12,
        fontWeight: "bold",
        color: "#302b24"
      }
}) 