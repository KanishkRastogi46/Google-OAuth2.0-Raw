export default function decodeJwtPayload(payload) {
    try {
        return JSON.parse(atob(payload));
    } catch (error) {
        console.log(error);
        return null;
    }
}