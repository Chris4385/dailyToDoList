//Date 
exports.currentDate = function(){
    const today = new Date();
    const options = {day:"numeric",month:"long",weekday:"short"};
    return today.toLocaleDateString("en-US",options);

}
exports.currentDay = function(){
    const today = new Date();
    const options = {weekday:"long"};
    return today.toLocaleDateString("en-US",options);
}
