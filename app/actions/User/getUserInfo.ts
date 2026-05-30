import { useUserInfo } from "@/store";

export const getUserInfo = async () => {
  try {
    const { setUserInfo } = useUserInfo.getState();
    const response = await fetch(process.env.NEXT_PUBLIC_GET_USER_INFO as string);
    const userInfo = await response.json();
    setUserInfo(userInfo);
    return userInfo;
  } catch (err) {
    console.log(err);

    return {
      id: "",
      name: "",
      email: "",
      role: "",
      image: "",
    };
  }
};
