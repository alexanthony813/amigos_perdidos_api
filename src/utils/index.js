export const subscribeUserToQuiltro = async (user, quiltroId) => {
  user.quiltroIds = !user.quiltroIds
    ? [quiltroId]
    : user.quiltroIds.slice().concat([quiltroId]);
  await user.save();
};

export const recordUserAdoptionInquiry = async (user, quiltroId) => {
  user.adoptionInquiryIds = !user.adoptionInquiryIds
    ? [quiltroId]
    : user.adoptionInquiryIds.slice().concat([quiltroId]);
  await user.save();
};
