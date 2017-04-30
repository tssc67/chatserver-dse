function randomUsername(){
    function randomPick(arr){
        return arr[randomNumber(0,arr.length)];
    }
    function randomNumber(min,max){
        return Math.floor(Math.random()*max)+min;
    }
    var adj = ["Big","Tiny","Little","Happy","Sad","Fun","Jump","Ghost","Catastrophe","Hello","Heya","Hooray","Sexy","Handsome","Marvelous","Panic"];
    var noun = ["Bear","Dog","Cat","Fish","Human","God","Zeus","Jesus","Bunny","Kitty","Dogy","Boy","Girl","Man","Woman","Male","Female","Child","ApacheHelicopter","Worm","Trump","Whatever","Tank","Boat","Spaceship","Jet","Moon","Sun","Galaxy","Hippy"];
    return randomPick(adj) + randomPick(noun) + randomNumber(0,10000);
}