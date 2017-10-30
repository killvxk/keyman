//
//  Constants.swift
//  KeymanEngine
//
//  Created by Gabriel Wong on 2017-10-20.
//  Copyright © 2017 SIL International. All rights reserved.
//

public struct Key {
  public static let keyboardId = "kbId"
  public static let languageId = "langId"

  public static let fontFamily = "family"
  public static let fontSource = "source"
  public static let fontFiles = "files"
  // Font filename is deprecated
  public static let fontFilename = "filename"
  public static let fontName = "fontname"
  public static let fontRegistered = "fontregistered"
  public static let keyboardInfo = "keyboardInfo"

  /// Array of user keyboards info list in UserDefaults
  public static let userKeyboardsList = "UserKeyboardsList"

  /// Currently/last selected keyboard info in UserDefaults
  public static let userCurrentKeyboard = "UserCurrentKeyboard"

  // Internal user defaults keys
  static let engineVersion = "KeymanEngineVersion"
  static let keyboardPickerDisplayed = "KeyboardPickerDisplayed"
  static let synchronizeSWKeyboard = "KeymanSynchronizeSWKeyboard"

  // JSON keys for language REST calls
  static let options = "options"
  static let language = "language"

  // TODO: Check if it matches with the key in Keyman Cloud API
  static let keyboardCopyright = "copyright"
  static let languages = "languages"

  // Other keys
  static let update = "update"
}

public struct Constants {
  private static let defaultFont = Font(family: "LatinWeb", source: ["DejaVuSans.ttf"], size: nil)
  public static let defaultKeyboard = InstallableKeyboard(id: "european2",
                                                          name: "EuroLatin2 Keyboard",
                                                          languageID: "eng",
                                                          languageName: "English",
                                                          version: "1.6",
                                                          isRTL: false,
                                                          font: defaultFont,
                                                          oskFont: nil,
                                                          isCustom: false)
}