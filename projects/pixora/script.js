// --- Main Element References ---
const addBtn = document.getElementById("addBtn"); // Get the "Add" button element by its ID
const itemInput = document.getElementById("itemInput"); // Get the input box where the user types a photo title
const galleryList = document.getElementById("galleryList"); // Get the list (UL or container) that will hold added photos
const itemCount = document.getElementById("itemCount"); // Get the element that shows total number of photos added
const checkoutBtn = document.getElementById("checkoutBtn"); // Get the checkout or submit button
const clearBtn = document.getElementById("clearBtn"); // Get the "Clear" button element

checkoutBtn.textContent = "Submit"; // Set the button text to "Submit" when page loads

let count = 0; // Initialize counter to track how many photos have been added

// --- Default Fallback Image ---
const defaultImage = "https://i.pinimg.com/1200x/13/c7/06/13c706cf6e9dd1bc2bb42d33c221af31.jpg"; // Used when no matching photo is found in gallery

// --- Function to Find if Photo Exists in Gallery ---
function findExistingPhoto(title) { // Function checks if the photo title already exists in gallery
  const photos = document.querySelectorAll(".gallery .photo"); // Select all elements with class 'photo' inside '.gallery'
  for (let photo of photos) { // Loop through each photo
    const caption = photo.querySelector(".caption").textContent.trim().toLowerCase(); // Get the caption text, trim spaces, and lowercase
    if (caption === title.toLowerCase()) { // Compare existing caption with entered title (case-insensitive)
      return photo.querySelector("img").src; // If match found, return that image's source URL
    }
  }
  return null; // Return null if no existing match found
}

// --- Add Photo Logic ---
addBtn.addEventListener("click", function() { // When "Add" button is clicked
  const val = itemInput.value.trim(); // Get user input and remove extra spaces
  if (val === "") { // Check if input is empty
    alert("Please enter a photo title!"); // Alert user to type something
    return; // Exit the function early
  }

  const li = document.createElement("li"); // Create new <li> element for the photo item

  const title = document.createElement("span"); // Create a <span> for displaying the title text
  title.textContent = val; // Set the span text to the entered title

  const existingImgSrc = findExistingPhoto(val); // Check if the same title already exists in gallery
  const img = document.createElement("img"); // Create an <img> element
  img.src = existingImgSrc || defaultImage; // Use existing image if found, otherwise default image
  img.alt = val; // Set alt text for accessibility
  img.classList.add("thumb"); // Add class for thumbnail styling

  const del = document.createElement("button"); // Create a delete button for this list item
  del.textContent = "Delete"; // Set button text to "Delete"
  del.classList.add("deleteBtn"); // Add a CSS class for styling

  del.addEventListener("click", function() { // Add click function to delete button
    li.remove(); // Remove the list item from gallery
    count--; // Decrease count
    updateCounter(); // Refresh the displayed item count
  });

  li.appendChild(title); // Add title text to list item
  li.appendChild(img); // Add image to list item
  li.appendChild(del); // Add delete button to list item
  galleryList.appendChild(li); // Append the completed <li> into the gallery list

  count++; // Increase count by one
  updateCounter(); // Update the count display
  itemInput.value = ""; // Clear input box for next entry
});

// --- Update Total Count Display ---
function updateCounter() { // Function updates the count text
  itemCount.textContent = count; // Set text content to current count value
}

// --- Clear All Photos from Main Gallery ---
clearBtn.addEventListener("click", function() { // When "Clear" button clicked
  if (count === 0) { // If no photos
    alert("No photos to clear!"); // Alert user
  } else { // Otherwise, if photos exist
    galleryList.innerHTML = ""; // Remove all list items
    count = 0; // Reset count to 0
    updateCounter(); // Update display
  }
});

// --- Sidebar Elements References ---
const fabBtn = document.getElementById("fabBtn"); // Floating Action Button that opens sidebar
const saveSidebar = document.getElementById("saveSidebar"); // Sidebar container element
const closeSidebar = document.getElementById("closeSidebar"); // Close button in sidebar
const sidebarAddBtn = document.getElementById("sidebarAddBtn"); // "Add" button inside sidebar
const sidebarSubmitBtn = document.getElementById("sidebarSubmitBtn"); // Submit button in sidebar
const sidebarItemInput = document.getElementById("sidebarItemInput"); // Input field inside sidebar
const sidebarGalleryList = document.getElementById("sidebarGalleryList"); // List to hold sidebar photos
const sidebarClearBtn = document.getElementById("sidebarClearBtn"); // "Clear" button in sidebar

let sidebarCount = 0; // Initialize counter for sidebar photos
let sidebarOpen = false; // Track whether sidebar is open or closed

// --- Open Sidebar ---
fabBtn.addEventListener("click", function() { // When FAB button clicked
  if (!sidebarOpen) { // Only open if currently closed
    saveSidebar.classList.add("active"); // Add class to show sidebar
    sidebarOpen = true; // Mark as open
    fabBtn.style.display = "none"; // Hide FAB button when sidebar is visible
  }
});

// --- Close Sidebar ---
closeSidebar.addEventListener("click", function() { // When close button clicked
  saveSidebar.classList.remove("active"); // Remove 'active' class to hide sidebar
  sidebarOpen = false; // Mark as closed
  fabBtn.style.display = "flex"; // Show FAB button again
});

// --- Function to Find Matching Photo in Main Gallery ---
function findExistingPhotoInGallery(title) { // Similar to earlier function but used for sidebar
  const photos = document.querySelectorAll(".gallery .photo"); // Select all gallery photos
  for (let photo of photos) { // Loop through them
    const caption = photo.querySelector(".caption").textContent.trim().toLowerCase(); // Get caption text
    if (caption === title.toLowerCase()) { // If match found
      return photo.querySelector("img").src; // Return its image URL
    }
  }
  return defaultImage; // Return default image if not found
}

// --- Add Photo to Sidebar ---
sidebarAddBtn.addEventListener("click", function() { // When "Add" clicked in sidebar
  const val = sidebarItemInput.value.trim(); // Get input value and remove spaces
  if (val === "") { // Check if input empty
    alert("Please enter a photo title!"); // Alert user
    return; // Exit
  }

  const li = document.createElement("li"); // Create list item for sidebar photo

  const img = document.createElement("img"); // Create image element
  img.src = findExistingPhotoInGallery(val); // Use existing gallery photo if available
  img.alt = val; // Add alt description
  img.classList.add("thumb"); // Add thumbnail class

  const span = document.createElement("span"); // Create span for title text
  span.textContent = val; // Set span text to entered title

  const del = document.createElement("button"); // Create delete button
  del.textContent = "Delete"; // Label it
  del.classList.add("deleteBtn"); // Style class
  del.addEventListener("click", function() { // When delete clicked
    li.remove(); // Remove from list
    sidebarCount--; // Decrease counter
    updateSidebarCounter(); // Refresh sidebar count display
  });

  li.appendChild(img); // Add image
  li.appendChild(span); // Add title text
  li.appendChild(del); // Add delete button
  sidebarGalleryList.appendChild(li); // Add whole list item to sidebar list

  sidebarCount++; // Increase counter
  updateSidebarCounter(); // Update displayed count
  sidebarItemInput.value = ""; // Clear input box
});

// --- Update Sidebar Counter ---
function updateSidebarCounter() { // Function to show current number of sidebar photos
  document.getElementById("sidebarItemCount").textContent = sidebarCount; // Update count text
}

// --- Clear All Sidebar Photos ---
sidebarClearBtn.addEventListener("click", function() { // When sidebar clear button clicked
  if (sidebarCount === 0) { // If no items
    alert("No photos to clear!"); // Alert user
  } else { // If items exist
    sidebarGalleryList.innerHTML = ""; // Remove all sidebar items
    sidebarCount = 0; // Reset sidebar count
    updateSidebarCounter(); // Refresh display
  }
});

// --- Recently Added Section ---
const recentlyAddedGrid = document.getElementById("recentlyAddedGrid"); // Grid that displays recently added photos
let recentlyAddedPhotos = []; // Array to store added photos data

// --- Checkout Logic (Main Submit Button) ---
checkoutBtn.addEventListener("click", function() { // When submit button clicked
  if (count === 0) { // If no photos yet
    alert("No photos added yet!"); // Warn user
  } else {
    alert("Added to collections completed!"); // Notify user
    const currentPhotos = Array.from(galleryList.querySelectorAll("li")); // Get all photo list items

    currentPhotos.forEach(function(li) { // Loop through each
      const img = li.querySelector("img"); // Get image element
      const title = li.querySelector("span").textContent; // Get photo title
      recentlyAddedPhotos.push({ // Add photo info to array
        src: img.src,
        title: title
      });
    });

    updateRecentlyAddedGrid(); // Refresh recently added grid with new photos
  }
});

// --- Submit Sidebar Collection ---
sidebarSubmitBtn.addEventListener("click", function() { // When sidebar submit button clicked
  if (sidebarCount === 0) { // If empty
    alert("No photos added yet!"); // Warn user
  } else {
    alert("Added to your collection!"); // Notify user
    const currentPhotos = Array.from(sidebarGalleryList.querySelectorAll("li")); // Get sidebar photos

    currentPhotos.forEach(function(li) { // Loop each
      const img = li.querySelector("img"); // Get image
      const title = li.querySelector("span").textContent; // Get title
      recentlyAddedPhotos.push({ // Add to recent list
        src: img.src,
        title: title
      });
    });

    updateRecentlyAddedGrid(); // Update recently added grid
  }
});

// --- Function to Update Recently Added Grid ---
function updateRecentlyAddedGrid() {
  const currentPhotos = recentlyAddedGrid.querySelectorAll(".recent-photo"); // Select existing photos
  currentPhotos.forEach(function(photo) { // Remove them
    photo.remove();
  });

  recentlyAddedGrid.classList.remove("has-photos"); // Reset class state

  if (recentlyAddedPhotos.length > 0) { // If there are photos to show
    recentlyAddedGrid.classList.add("has-photos"); // Add styling class

    const photosToShow = recentlyAddedPhotos.slice(-6); // Show only last 6 photos

    photosToShow.forEach(function(photo) { // Loop each photo
      const img = document.createElement("img"); // Create <img> element
      img.src = photo.src; // Set source
      img.alt = photo.title; // Set alt text
      img.title = photo.title; // Tooltip title
      img.classList.add("recent-photo"); // Add class for styling

      img.addEventListener("click", function() { // Add click behavior to show details
        alert("Photo: " + photo.title); // Simple alert with photo title
      });

      recentlyAddedGrid.appendChild(img); // Add to grid container
    });
  } else {
    recentlyAddedGrid.classList.remove("has-photos"); // If no photos, ensure class removed
  }
}

// --- Initialize Recently Added Grid on Page Load ---
updateRecentlyAddedGrid(); // Makes sure grid is initialized when page opens

// --- Dark Mode Toggle ---
const darkModeToggle = document.getElementById("darkModeToggle"); // Get dark mode toggle button
const body = document.body; // Reference to <body> element
const toggleLabel = document.querySelector(".toggle-label"); // Label beside toggle button

toggleLabel.textContent = "Dark Mode"; // Set default label text

darkModeToggle.addEventListener("click", function() { // When toggle clicked
  body.classList.toggle("dark-mode"); // Add or remove 'dark-mode' class

  if (body.classList.contains("dark-mode")) { // If dark mode active
    toggleLabel.textContent = "Light Mode"; // Change label to "Light Mode"
  } else {
    toggleLabel.textContent = "Dark Mode"; // Otherwise revert
  }
});

// --- Scroll to Top Button ---
const scrollUpBtn = document.getElementById("scrollUpBtn"); // Get the scroll-to-top button

window.addEventListener("scroll", function() { // When user scrolls
  if (window.pageYOffset > 300) { // If scrolled more than 300px
    scrollUpBtn.classList.add("show"); // Show button
  } else {
    scrollUpBtn.classList.remove("show"); // Hide button
  }
});

scrollUpBtn.addEventListener("click", function() { // When scroll button clicked
  window.scrollTo({ // Smoothly scroll to top of page
    top: 0,
    behavior: "smooth"
  });
});
