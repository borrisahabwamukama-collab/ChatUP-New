const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

exports.moderator = onDocumentCreated("posts/{postId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const postData = snapshot.data();
  const caption = postData.caption ? postData.caption.toLowerCase() : "";
  const restrictedWords = ["nudity", "badword1", "badword2"];
  
  if (restrictedWords.some(word => caption.includes(word))) {
    console.log(`Inappropriate content detected in post ${event.params.postId}. Flagging...`);
    
    // Using the cleanly imported FieldValue directly
    await snapshot.ref.update({
      status: "flagged",
      moderatedAt: FieldValue.serverTimestamp()
    });
  }
});