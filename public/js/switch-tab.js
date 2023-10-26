document.addEventListener('DOMContentLoaded', function() {

    // Get the current section
    const currentProfileSection = document.querySelector('.friends-container');

    const tester = document.getElementById('main-container');
  
    // Get the div that should be clicked
    const clickableDiv = document.querySelector('.friend_name');
    // Attach click event
    clickableDiv.addEventListener('click', function() {
      // Hide the current section
    //   console.log(currentProfileSection2);
    // currentProfileSection.style.display = 'none';

      currentProfileSection.style.visibility = 'hidden';
  
      // Assuming there are multiple .friends-profile, 
      // get all of them and make the first one visible 
      // (or whichever one you want)
      const FriendProfiles = document.querySelector('#individual-profile');
      FriendProfiles.style.visibility = 'visible';
    });
  
  });
  