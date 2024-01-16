import { Modal, Button } from "react-bulma-components";

const ReserveModal = ({
  toggleReserveModal,
  content,
  showReserveModal,
  createReservation,
  reserved,
  loading,
}) => {
  return (
    <Modal
      show={showReserveModal}
      onClose={toggleReserveModal}
      closeOnBlur={true}
      showClose={false}
      className="scrollable"
    >
      <Modal.Card backgroundColor="circles">
        <Modal.Card.Body>
          {content}
          <Button.Group>
            <Button
              className={loading ? "is-loading" : "input-danger"}
              color="danger"
              onClick={createReservation}
              disabled={reserved}
            >
              Okay
            </Button>
          </Button.Group>
        </Modal.Card.Body>
      </Modal.Card>
    </Modal>
  );
};

export default ReserveModal;
