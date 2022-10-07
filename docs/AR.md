# Augmented Reality Documentation

![Viro](https://raw.githubusercontent.com/ViroCommunity/virocommunity.github.io/main/viro_community_logo.png)

The information required to use the Augmented Reality feature will be specified here

## Package used and system requirements

- [Viro](https://viro-community.readme.io)
- [iOS Requirements](https://developer.apple.com/library/archive/documentation/DeviceInformation/Reference/iOSDeviceCompatibility/DeviceCompatibilityMatrix/DeviceCompatibilityMatrix.html)
- [Android Requirements](https://developers.google.com/ar/devices)

## What to do on the server side

- Go to the CMS page and log in
- Go to the list of tours
- Select the tour you want to add Augmented Reality feature to
- Add new Tourstopps on the tour detail page
- Edit the sections added for AugmentedReality in Tourstopps
- To find out what types of files you can upload, see the next section

## What to do on the server side

- **VRX:** To upload a 3D model, you must make sure that the model is in VRX format. (Required) [Viro3DObject](https://viro-community.readme.io/docs/viro3dobject)
- **TARGET:** If you want your 3D model to have an image recognition function, upload the desired image in this section (Optional) [ViroARImageMarker](https://viro-community.readme.io/docs/viroarimagemarker)
- **MP3:** If you want a sound file in Augmented Reality scene, upload it to this section (Optional) [ViroSound](https://viro-community.readme.io/docs/virosound)
- **MP4:** If you want a video on Augmented Reality scene, please upload it to this section (Optional) [ViroVideo](https://viro-community.readme.io/docs/virovideo)
- **IMAGE:** If you want a picture in the Augmented Reality scene, upload it to this section (Optional) [ViroImage](https://viro-community.readme.io/docs/viroimage)
- **TEXTURE:** The section where you can upload the texture files required for the 3D model (Required)
  - **Important!** Each texture file has a specific name. Please enter this specific name in the name field. Otherwise there will be a problem in displaying the 3D model.

## Customisation of the Augmented Reality scene

**Note!** To view the customisation in Augmented Reality scene, you need to delete the 3D model you downloaded in the application and download it again!

- **Name:** Write the name you want your 3D model to be displayed in this section (Required)
- **Description:** Write the description you want your 3D model to be displayed in this section (Optional)
- **Geo-Koordinaten:**
  - **Latitude & Longitude:** Write the coordinates of your 3D model that you want to be displayed on the map in this section (Optional)
- **Animation name:** The field where the name of the animation of the 3D model can be written (Optional)
- **Package size:** This is the field where the total size of all Augmented Reality scene objects you have loaded should be written in bytes. The value added to this section allows the user to show how many MB files will be downloaded in the application. (Required)
- **VRX & MP4 & IMAGE:**
  - Set the Position, Size and Rotation properties according to x,y,z coordinates. [Scenes](https://viro-community.readme.io/docs/scenes)
- **TARGET:**
  - _Physical width_ - Allows you to set the distance in the physical world (in metres) between the image and the device's camera.
- **MP3:**
  - _Is spatial sound_ - A field that allows you to specify whether the audio file you are uploading has spatial audio capability. takes true or false value [ViroSpatialSound](https://viro-community.readme.io/docs/virospatialsound#onfinish)
  - If Spatial Audio is true:
    - _Max distance:_ A distance after which the audio can not be heard.
    - _Min distance:_ A distance after which the audio will begin to attenuate until maxDistance where the sound is completely gone.
    - _Rolloff model:_ The rolloff model which determines how the sound volume will fall off between minDistance and maxDistance. Can take `None`, `Linear` & `Logarithmic` values as String
- **MP4:**
  - _Chroma key filtered video_ - If the video you want to add to the Augmented Reality scene has a background colour that you want to delete, add the colour code in HEX format here.

## Display of added tourstopps in the app

To download the 3D Model from the Tour detail screen:

1. Press the hamburger menu button in the top right corner of the app and select "Tours and Places" from the drop-down menu,
2. Scroll to the bottom of the page and in the "Tours" category select the section where you have added Tourstopps,
3. Select the tour you added Tourstopps to from the displayed tour list and scroll to the bottom of the tour details page,
4. Select the downloaded file from the Artworks list and click on the "Downloaden & AR Kunst gucken" button and wait for the 3D object to download,
5. Click the View AR Art button and view the 3D model on the screen that opens.

To download the 3D Model from the settings screen:

- **Note:** To avoid an error in the settings page, please manually add the id of the tour you added tourstopp to the id section in line 247 of the `SettingsScreen`.

1. Go to the settings page of the application.
2. Select `AR Settings`.
3. Download the "Sample File" to your device.

To delete the 3D Model from the device:

1. Open the detail page of the relevant tour.
2. Scroll down the detail page.
3. Click on the "Kunstwerke laden" button and wait for the modal to open.
4. In the opened modal, an x will be displayed next to the items you have downloaded to your device
5. Click on the downloaded item. Select "Delete" on the warning screen.
6. If you see the download button again, the 3D object has been deleted from your device.

Delete the 3D Model from the settings screen:

1. Go to the settings page of the app.
2. Select "AR settings".
3. In the list you will see an "x" next to the items you have downloaded to your device.
4. Click on the downloaded item. Select "Delete" on the warning screen.
5. When you see the download button again, the 3D object has been deleted from your device.

## Converter required when uploading a 3D Model

- [FBX to VRX converter](https://github.com/ViroCommunity/ViroFBX)
