class Profile {
  constructor() {
    this.id = undefined;
    this.notificationTokens = [];
    this.displayName = "";
    this.email = "";
    this.address = "";
    this.birthDate = "";
    this.age = "";
    this.createdAt = "";
    this.updatedAt = "";
  }

  static fromFirestore(id, data) {
    if (!data) {
      throw new Error("Data is undefined");
    }

    const profile = new Profile();
    profile.id = id;
    profile.notificationTokens = data.notificationTokens || [];
    profile.displayName = data.displayName || "";
    profile.email = data.email || "";
    profile.address = data.address || "";
    profile.birthDate = data.birthDate || "";
    profile.age = data.age || "";
    profile.createdAt = data.createdAt || "";
    profile.updatedAt = data.updatedAt || "";

    return profile;
  }

  toFirestore() {
    return {
      notificationTokens: this.notificationTokens,
      displayName: this.displayName,
      email: this.email,
      address: this.address,
      birthDate: this.birthDate,
      age: this.age,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  addNotificationToken(token) {
    if (token && !this.notificationTokens.includes(token)) {
      this.notificationTokens.push(token);
    }
  }

  removeNotificationToken(token) {
    this.notificationTokens = this.notificationTokens.filter(
        (t) => t !== token,
    );
  }

  hasValidNotificationTokens() {
    return this.notificationTokens && this.notificationTokens.length > 0;
  }
}

module.exports = {Profile};
