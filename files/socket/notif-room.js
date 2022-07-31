module.exports = (client)=> {
  client.on("creatNotifRoom", (myID)=> {
    client.join(myID)
  });
};