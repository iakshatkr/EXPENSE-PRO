    // Global variables
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // DOM elements
    const themeToggle = document.getElementById('theme-toggle');
    const totalExpensesStat = document.getElementById('total-expenses');
    const totalTransactionsStat = document.getElementById('total-transactions');
    const accountAgeStat = document.getElementById('account-age');

    // Initialize the app
    document.addEventListener('DOMContentLoaded', function() {
        loadProfileData();
        updateProfileStats();
        
        // Dark mode toggle
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
        });

        // Profile picture upload
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        const profileImg = document.getElementById('profile-img');
        
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileImg.src = e.target.result;
                    localStorage.setItem('profileImage', e.target.result);
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
        
        // Save profile button
        document.getElementById('save-profile').addEventListener('click', function() {
            saveProfileData();
        });
        
        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', function() {
            loadProfileData();
        });
    });

    // Load Profile Data
    function loadProfileData() {
        const name = localStorage.getItem('profileName') || 'John Doe';
        const email = localStorage.getItem('profileEmail') || 'john@example.com';
        const phone = localStorage.getItem('profilePhone') || '+91 98765 43210';
        const bio = localStorage.getItem('profileBio') || 'I\'m a regular user of Expense Tracker and I love managing my finances with this app.';
        const image = localStorage.getItem('profileImage') || 'https://via.placeholder.com/150';
        
        document.getElementById('profile-name').textContent = name;
        document.getElementById('profile-email').textContent = email;
        document.getElementById('profile-img').src = image;
        document.getElementById('name').value = name;
        document.getElementById('email').value = email;
        document.getElementById('phone').value = phone;
        document.getElementById('bio').value = bio;
    }

    // Save Profile Data
    function saveProfileData() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const bio = document.getElementById('bio').value;
        
        localStorage.setItem('profileName', name);
        localStorage.setItem('profileEmail', email);
        localStorage.setItem('profilePhone', phone);
        localStorage.setItem('profileBio', bio);
        
        document.getElementById('profile-name').textContent = name;
        document.getElementById('profile-email').textContent = email;
        
        alert('Profile updated successfully!');
    }

    // Update Profile Stats
    function updateProfileStats() {
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, item) => sum + item.amount, 0);
        const totalTransactions = transactions.length;
        const firstTransactionDate = transactions.length > 0 
            ? new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())))
            : new Date();
        const accountAgeMonths = Math.floor((new Date() - firstTransactionDate) / (1000 * 60 * 60 * 24 * 30));
        
        totalExpensesStat.textContent = `₹${totalExpenses.toFixed(2)}`;
        totalTransactionsStat.textContent = totalTransactions;
        accountAgeStat.textContent = accountAgeMonths || 0;
    }

    // Form Validation
    function validateForm() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) {
            alert('Name is required!');
            return false;
        }
        if (!email || !emailRegex.test(email)) {
            alert('Please enter a valid email address!');
            return false;
        }
        return true;
    }