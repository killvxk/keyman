//
//  KeyboardPickerButton.swift
//  KeymanEngine
//
//  Created by Gabriel Wong on 2017-09-12.
//  Copyright © 2017 SIL International. All rights reserved.
//

import UIKit
import QuartzCore

public class KeyboardPickerButton: UIButton {
  weak var presentingVC: UIViewController?

  @objc public init(presentingVC: UIViewController) {
    super.init(frame: .zero)
    self.presentingVC = presentingVC

    layer.cornerRadius = 8.0
    clipsToBounds = true
    setColor(UIColor(red: 0.62, green: 0.68, blue: 0.76, alpha: 1.0))
    addTarget(self, action: #selector(self.showKeyboardPicker), for: .touchUpInside)

    let bundlePath = Bundle(for: type(of :self)).path(forResource: "Keyman", ofType: "bundle")!
    let retinaSuffix = KMManager.retinaScreen() ? "@2x" : ""
    let imagePath = Bundle(path: bundlePath)!.path(forResource: "keyboard_icon\(retinaSuffix)", ofType: "png")!

    setImage(UIImage(contentsOfFile: imagePath), for: .normal)
    sizeToFit()
    frame = frame.insetBy(dx: -15.0, dy: -3.0)
  }

  public required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  deinit {
    presentingVC = nil
  }

  @objc func showKeyboardPicker() {
    if let presentingVC = presentingVC {
      KMManager.sharedInstance().showKeyboardPicker(in: presentingVC, shouldAddKeyboard: false)
    }
  }

  // Clear images if the developer sets a title
  public override func setTitle(_ title: String?, for state: UIControlState) {
    setImage(nil, for: state)
    super.setTitle(title, for: state)
  }

  func setColor(_ color: UIColor) {
    let rect = CGRect(x: 0, y: 0, width: 1, height: 1)
    UIGraphicsBeginImageContext(rect.size)
    guard let context = UIGraphicsGetCurrentContext() else {
      return
    }
    UIGraphicsPushContext(context)
    context.setFillColor(color.cgColor)
    context.fill(rect)
    let bgImg = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsPopContext()
    UIGraphicsEndImageContext()
    setBackgroundImage(bgImg, for: .normal)
  }
}
