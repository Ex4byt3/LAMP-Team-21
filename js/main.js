const urlBase = '/API';
const extension = 'php';

let userId = -1;
let contactId = -1;
let shouldSort = -1;
let exporting = 0;

function doRegister() {
	let firstName = document.getElementById("registerFirstNameField").value;
	let lastName = document.getElementById("registerLastNameField").value;
	let username = document.getElementById("usernameField").value; // not "register" so doLogin can read it easily
	let password = document.getElementById("passwordField").value;
	let retypePassword = document.getElementById("registerRetypePasswordField").value;

	if (password !== retypePassword) {
		document.getElementById("registerResult").innerHTML = "Passwords do not match";
		return;
	}

	let jsonPayload = JSON.stringify({
		FirstName: firstName,
		LastName: lastName,
		Username: username,
		Password: password
	});

	let url = urlBase + "/Register." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				if (jsonObject.error) {
					document.getElementById("resultMessage").innerHTML = jsonObject.error;
				} else {
					document.getElementById("resultMessage").innerHTML = "Registration successful";
					doLogin();
				}
			}
		};
		xhr.send(jsonPayload);
	} catch (err) {
		document.getElementById("resultMessage").innerHTML = err.message;
	}
}

function doLogin() {
	userId = 0;
	firstName = "";
	lastName = "";

	// Get the username and password values from the form data
	const username = document.getElementById("usernameField").value;
	const password = document.getElementById("passwordField").value;

	document.getElementById("resultMessage").innerHTML = "";

	let tmp = { username: username, password: password };
	//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1) {
					document.getElementById("resultMessage").innerHTML = "Username/Password is incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();

				window.location.href = "contactmanager.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		document.getElementById("resultMessage").innerHTML = err.message;
	}

}

function saveCookie() {
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime() + (minutes * 60 * 1000));
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for (var i = 0; i < splits.length; i++) {
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if (tokens[0] == "firstName") {
			firstName = tokens[1];
		}
		else if (tokens[0] == "lastName") {
			lastName = tokens[1];
		}
		else if (tokens[0] == "userId") {
			userId = parseInt(tokens[1].trim());
		}
	}

	if (userId < 0) {
		window.location.href = "index.html";
	}
	else {
		document.getElementById("nameDisplay").innerHTML = "Welcome back, " + firstName + " " + lastName + ".";
	}
}

function doLogout() {
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function showAddContactModal() {
	// Show the modal
	document.getElementById('addContactModal').classList.remove('hidden');
}

function hideAddContactModal() {
	// Hide the modal
	document.getElementById('addContactModal').classList.add('hidden');
}

function clearAddContactFields() {
	// Clear the input fields
	document.getElementById('addFirstNameField').value = '';
	document.getElementById('addLastNameField').value = '';
	document.getElementById('addEmailField').value = '';
	document.getElementById('addPhoneField').value = '';
	document.getElementById('addAddressField').value = '';
	document.getElementById('addCityField').value = '';
	document.getElementById('addStateField').value = '';
	document.getElementById('addZipField').value = '';
}

function formatPhone(phone) {
	const numPhone = phone.replace(/\D/g, '');
	// North America
	if (numPhone.length === 10) {
		return `(${numPhone.slice(0, 3)}) ${numPhone.slice(3, 6)}-${numPhone.slice(6, 10)}`;
	}
	// North America - International
	else if (numPhone.length === 11) {
		return `+1 (${numPhone.slice(1, 3)}) ${numPhone.slice(3, 6)}-${numPhone.slice(6, 10)}`;
	}
	// European (With Country Code)
	else if (numPhone.length === 12) {
		return `+${numPhone.slice(0, 2)} ${numPhone.slice(2, 6)} ${numPhone.slice(6)}`;
	}
	// European (With Country Code and Longer Local Code)
	else if (numPhone.length === 15) {
		return `+${numPhone.slice(0, 2)} ${numPhone.slice(2, 3)} ${numPhone.slice(3, 5)} ${numPhone.slice(5, 7)} ${numPhone.slice(7, 9)} ${numPhone.slice(9, 11)} ${numPhone.slice(11)}`
	}
	else {
		return phone;
	}
}

function addContact() {
	let newFirstName = document.getElementById("addFirstNameField").value;
	let newLastName = document.getElementById("addLastNameField").value;
	let newEmail = document.getElementById("addEmailField").value;
	let newPhone = document.getElementById("addPhoneField").value;
	let newAddress = document.getElementById("addAddressField").value;
	let newCity = document.getElementById("addCityField").value;
	let newState = document.getElementById("addStateField").value;
	let newZip = document.getElementById("addZipField").value;

	if (!document.getElementById("addFirstNameField").checkValidity()) {
		alert(document.getElementById("addFirstNameField").title);
		return false;
	}

	// json payload
	let tmp = {
		UserId: userId,
		FirstName: newFirstName,
		LastName: newLastName,
		Email: newEmail,
		Phone: newPhone,
		Address: newAddress,
		City: newCity,
		State: newState,
		Zip: newZip
	};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				// document.getElementById("contactAddResult").innerHTML = "Contact has been added";
				window.location.reload()
			}
		};
		xhr.send(jsonPayload);
		clearAddContactFields();
		hideAddContactModal();
	}
	catch (err) {
		// document.getElementById("contactAddResult").innerHTML = err.message;
	}

}

function exportContacts(contacts) {
	if (contacts.length === 0) {
		alert("Cannot export to CSV. There are currently 0 contacts in your account. Add contacts to download.");
		return;
	}

	const sortingOption = document.getElementById("sortOptions").value;
	switch (sortingOption) {
		case "lastNameAsc":
			contacts.sort((a, b) => a.LastName.localeCompare(b.LastName));
			break;
		case "lastNameDsc":
			contacts.sort((a, b) => b.LastName.localeCompare(a.LastName));
			break;
		case "firstNameAsc":
			contacts.sort((a, b) => a.FirstName.localeCompare(b.FirstName));
			break;
		case "firstNameDsc":
			contacts.sort((a, b) => b.FirstName.localeCompare(a.FirstName));
			break;
		case "stateAsc":
			contacts.sort((a, b) => a.State.localeCompare(b.State));
			break;
		case "stateDsc":
			contacts.sort((a, b) => b.State.localeCompare(a.State));
			break;
		default:
			break;
	}

	let exportContent = "First Name,Last Name,Phone,Email,Address,City,State,Zip\n";
	contacts.forEach((contact) => {
		exportContent += `${contact.FirstName},${contact.LastName},${(contact.Phone)},${contact.Email},${contact.Address},${contact.City},${contact.State},${contact.Zip}\n`;
	});

	const blob = new Blob([exportContent], { type: "text/csv" });
	const urlDownload = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = urlDownload;
	a.download = "contacts.csv";
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(urlDownload);
	document.body.removeChild(a);
}

function searchContacts() {
	let searchText = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";

	let contactList = "";

	// package the search text and user id into a json payload
	let tmp = { search: searchText, userId: userId };
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				document.getElementById("contactSearchResult").innerHTML = "";
				let jsonObject = JSON.parse(xhr.responseText);

				document.getElementById("searchResultsContainer").style.display = "block";
				if (jsonObject.results == null) {
					document.getElementById("searchResultsContainer").style.display = "none";
					return;
				}
				console.log(shouldSort);
				switch (shouldSort) {
					// Last Name Ascending
					case 0:
						jsonObject.results.sort((a, b) => a.LastName.localeCompare(b.LastName));
						break;
					// Last Name Descending
					case 1:
						jsonObject.results.sort((a, b) => b.LastName.localeCompare(a.LastName));
						break;
					// First Name Ascending
					case 2:
						jsonObject.results.sort((a, b) => a.FirstName.localeCompare(b.FirstName));
						break;
					// First Name Descending
					case 3:
						jsonObject.results.sort((a, b) => b.FirstName.localeCompare(a.FirstName));
						break;
					// State Ascending
					case 4:
						jsonObject.results.sort((a, b) => a.State.localeCompare(b.State));
						break;
					// State Descending
					case 5:
						jsonObject.results.sort((a, b) => b.State.localeCompare(a.State));
						break;
					default:
						break;
				}

				if (exporting === 1) {
					exporting = 0;
					exportContacts(jsonObject.results.slice());
				}

				// Create a table element
				let table = document.createElement("table");
				table.classList.add("w-full", "table-auto", "border-collapse", "border");

				// Create the table header
				let thead = document.createElement("thead");
				let headerRow = document.createElement("tr");

				// Create Mobile Headers
				const mobileHeaders = ["Name", "Phone", "Email"];

				["Name", "Phone", "Email", "Address", "City", "State", "Zip"].forEach((headerText) => {
					let th = document.createElement("th");
					th.textContent = headerText;
					th.classList.add("px-4", "py-2", "bg-gray-900", "text-gray-200");

					// This hides the columns that will not be seen on smaller screens
					if (!mobileHeaders.includes(headerText)) {
						th.classList.add("hidden", "md:table-cell");
					}

					headerRow.appendChild(th);
				});
				thead.appendChild(headerRow);
				table.appendChild(thead);

				// Create the table body
				let tbody = document.createElement("tbody");
				jsonObject.results.forEach((contact, index) => {
					let row = document.createElement("tr");
					row.dataset.teToggle = "modal";
					row.dataset.teTarget = "#modal";
					row.addEventListener("click", function (event) {
						if (
							event.target !== phoneLink &&
							event.target !== emailLink
						) {
							populateUpdateModal(this);
						}
					});
					row.dataset.contactId = contact.ID;
					row.classList.add("cursor-pointer", "hover:bg-gray-700", index % 2 === 0 ? "bg-gray-800" : "bg-gray-850", "text-gray-100");

					// Combine First Name and Last Name
					let nameCell = document.createElement("td");
					nameCell.textContent = `${contact.FirstName} ${contact.LastName}`;
					nameCell.classList.add("px-4", "py-2", "whitespace-no-wrap");
					row.appendChild(nameCell);

					// Edit Phone Number Formatting
					let phoneCell = document.createElement("td");
					let phoneNumber = formatPhone(contact.Phone);
					let phoneLink = document.createElement("a");
					phoneLink.href = `tel:${phoneNumber}`;
					phoneLink.textContent = phoneNumber;
					phoneCell.append(phoneLink);
					phoneCell.classList.add("px-4", "py-2", "whitespace-no-wrap");
					row.append(phoneCell);

					// Make E-Mail Address Clickable
					let emailCell = document.createElement("td");
					let emailLink = document.createElement("a");
					emailLink.href = `mailto:${contact.Email}`;
					emailLink.textContent = contact.Email;
					emailCell.appendChild(emailLink);
					emailCell.classList.add("px-4", "py-2", "whitespace-no-wrap");
					row.append(emailCell);

					["Address", "City", "State", "Zip"].forEach((property) => {
						let td = document.createElement("td");
						td.textContent = contact[property];
						td.classList.add("px-4", "py-2", "whitespace-no-wrap");

						if (!mobileHeaders.includes(property)) {
							td.classList.add("hidden", "md:table-cell");
						}

						row.appendChild(td);
					});

					tbody.appendChild(row);
				});
				table.appendChild(tbody);

				// Append the table to the contactSearchResult element
				document.getElementById("contactSearchResult").appendChild(table);
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}

// Search for a contact by ID
function searchContactByID(contactId, userId) {
	let tmp = { contactId: contactId, userId: userId };
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/SearchContactByID.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.send(jsonPayload);
		let jsonObject = JSON.parse(xhr.responseText);
		return jsonObject;
	}
	catch (err) {
		// document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}

function handleSorting() {
	const sortOptions = document.getElementById('sortOptions');
	const selectedOption = sortOptions.value;
	console.log('Selected: ', selectedOption);

	switch (selectedOption) {
		case 'lastNameAsc':
			shouldSort = 0;
			break;
		case 'lastNameDsc':
			shouldSort = 1;
			break;
		case 'firstNameAsc':
			shouldSort = 2;
			break;
		case 'firstNameDsc':
			shouldSort = 3;
			break;
		case 'stateAsc':
			shouldSort = 4;
			break;
		case 'stateDsc':
			shouldSort = 5;
			break;
		default:
			break;
	}

	searchContacts();
}

function populateUpdateModal(row) {
	// Retrieve the contact data from the database
	contactId = row.getAttribute("data-contact-id"); // probably unsafe but works
	let contact = searchContactByID(contactId, userId); // should only ever return one contact
	let firstName = contact.result.FirstName;
	let lastName = contact.result.LastName;
	let phone = contact.result.Phone;
	let email = contact.result.Email;
	let address = contact.result.Address;
	let city = contact.result.City;
	let state = contact.result.State;
	let zip = contact.result.Zip;

	// Open the update modal and populate it with the contact data
	showUpdateContactModal();

	document.getElementById("updateFirstNameField").value = firstName
	document.getElementById("updateLastNameField").value = lastName
	document.getElementById("updatePhoneField").value = phone
	document.getElementById("updateEmailField").value = email
	document.getElementById("updateAddressField").value = address
	document.getElementById("updateCityField").value = city
	document.getElementById("updateStateField").value = state
	document.getElementById("updateZipField").value = zip
}

function showUpdateContactModal() {
	// Show the modal
	document.getElementById('updateContactModal').classList.remove('hidden');
}

function hideUpdateContactModal() {
	// Hide the modal
	document.getElementById('updateContactModal').classList.add('hidden');
}


function updateContact() {
	let FirstName = document.getElementById("updateFirstNameField").value;
	let LastName = document.getElementById("updateLastNameField").value;
	let Phone = document.getElementById("updatePhoneField").value;
	let Email = document.getElementById("updateEmailField").value;
	let Address = document.getElementById("updateAddressField").value;
	let City = document.getElementById("updateCityField").value;
	let State = document.getElementById("updateStateField").value;
	let Zip = document.getElementById("updateZipField").value;

	if (!document.getElementById("updateFirstNameField").checkValidity()) {
		alert(document.getElementById("updateFirstNameField").title);
		return false;
	}

	let tmp = {
		UserId: userId,
		ContactId: contactId,
		FirstName: FirstName,
		LastName: LastName,
		Phone: Phone,
		Email: Email,
		Address: Address,
		City: City,
		State: State,
		Zip: Zip
	};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/UpdateContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				// document.getElementById("contactUpdateResult").innerHTML = "Contact has been updated";
				window.location.reload();
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		// document.getElementById("contactUpdateResult").innerHTML = err.message;
	}
}

function deleteContact() {
	let deleteId = contactId; // probably also unsafe but works

	// document.getElementById("contactDeleteResult").innerHTML = "";

	let tmp = {
		ContactId: deleteId,
	};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/DeleteContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				// document.getElementById("contactDeleteResult").innerHTML = "Contact has been deleted";
				window.location.reload();
			}
		};
		xhr.send(jsonPayload);
		hideUpdateContactModal();

	}
	catch (err) {
		//document.getElementById("contactDeleteResult").innerHTML = err.message;
	}
}

function exportContactsHelper() {
	exporting = 1;
	searchContacts();
}

document.querySelectorAll('a[data-contact-id]').forEach(function (link) {
	link.addEventListener('click', function (event) {
		event.preventDefault(); // Prevent the default link behavior
		const contactID = this.getAttribute('data-contact-id');
		// Use the contactID as needed
		console.log('Contact ID:', contactID);
	});
});

document.addEventListener('keypress', function (e) {
	if (e.key === "Enter")
		doLogin();
});

document.getElementById('sortOptions').addEventListener('change', handleSorting);
