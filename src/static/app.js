document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and activity select options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants list
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";
        const participantsTitle = document.createElement("p");
        participantsTitle.innerHTML = "<strong>Participants:</strong>";
        participantsDiv.appendChild(participantsTitle);

        if (details.participants && details.participants.length > 0) {
          const ul = document.createElement("ul");
          details.participants.forEach((email) => {
            const li = document.createElement("li");

              const span = document.createElement("span");
              span.className = "participant-email";
              span.textContent = email;

              const btn = document.createElement("button");
              btn.className = "remove-participant";
              btn.title = "Unregister participant";
              btn.innerHTML = "✖";
              btn.addEventListener("click", async () => {
                try {
                  const res = await fetch(
                    `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`,
                    { method: "DELETE" }
                  );

                  const data = await res.json();
                  if (res.ok) {
                    messageDiv.textContent = data.message;
                    messageDiv.className = "success";
                    messageDiv.classList.remove("hidden");
                    // Refresh activities to update availability and list
                    fetchActivities();
                  } else {
                    messageDiv.textContent = data.detail || "Failed to unregister";
                    messageDiv.className = "error";
                    messageDiv.classList.remove("hidden");
                  }

                  setTimeout(() => messageDiv.classList.add("hidden"), 4000);
                } catch (err) {
                  console.error("Error unregistering:", err);
                  messageDiv.textContent = "Failed to unregister. Try again.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });
          participantsDiv.appendChild(ul);
        } else {
          const noP = document.createElement("p");
          noP.className = "no-participants";
          noP.textContent = "No participants yet";
          participantsDiv.appendChild(noP);
        }

        activityCard.appendChild(participantsDiv);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the new participant appears without manual reload
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
