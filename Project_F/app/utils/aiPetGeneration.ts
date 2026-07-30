import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type GeneratedPetImages = {
    neutral: string;
    happy: string;
    sad: string;
};

export const sendPictureToServer = async (image: string): Promise<GeneratedPetImages> => {
    try{

    if (!image) {
        throw new Error("Image selection error")
    }
    const formData = new FormData();
    formData.append("image", {
        uri: image,
        name: "pet_photo.jpg",
        type: "image/jpeg",
    } as any);

    const token = await AsyncStorage.getItem("auth_token");

    if (!token) {
        router.replace("/auth/loginScreen"); 
        throw new Error("Login required")
    }

    const response = await fetch("http://192.168.1.78:5000/aiGeneratePet", {
        method: "POST",
        body: formData,
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!data?.neutral || !data?.happy || !data?.sad) {
        throw new Error("The server did not return pet images.")
    }

    return {
        neutral: `data:image/png;base64,${data.neutral}`,
        happy: `data:image/png;base64,${data.happy}`,
        sad: `data:image/png;base64,${data.sad}`,
    };
    } catch (e){
        console.error("Could not upload image to ai API", e)
        throw e
    }
}